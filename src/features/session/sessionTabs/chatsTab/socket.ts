import { useCallback, useEffect, useRef, useState } from "react";
import {
	useQueryClient,
	type InfiniteData,
	type QueryClient,
} from "@tanstack/react-query";
import { refreshTokens, sessionApi } from "../../../../api/axios";
import {
	MessagesKey,
	PinnedMessagesKey,
	useDeleteMessageMutation,
	useEditMessageMutation,
	usePinMessageMutation,
	useSendMessageRest,
	useUnpinMessageMutation,
} from "./queries";
import type { MessagePage, SendMessageBody } from "./api";
import useAuth from "../../../auth/AuthProvider";
import type {
	ChatMessage,
	PinnedMessage,
	ReplySnippet,
} from "../../../../types/chat";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const SEND_TIMEOUT_MS = 5000;
const REFRESH_RETRY_DELAY_MS = 300;

const ConnectionStatus = {
	Connecting: "connecting",
	Open: "open",
	Closed: "closed",
} as const;

type ConnectionStatus =
	(typeof ConnectionStatus)[keyof typeof ConnectionStatus];

const ChatEventType = {
	Message: "message",
	Edit: "edit",
	Delete: "delete",
	Pin: "pin",
	Unpin: "unpin",
	Read: "read",
} as const;

type ChatEventType = (typeof ChatEventType)[keyof typeof ChatEventType];

// Mirrors chatws.OutgoingEvent — payload shape depends on `type`, so it's
// left as unknown here and narrowed in handleEnvelope.
interface WireEnvelope {
	type: ChatEventType;
	chatId: string;
	payload: unknown;
}

// Mirrors chatws.IncomingMessage — what we send.
interface OutgoingAction {
	type: ChatEventType;
	body?: string;
	replyToId?: string;
	attachments?: SendMessageBody["attachments"];
	mentionedUserIds?: string[];
	clientNonce?: string;
	messageId?: string;
}

function wsBaseURL(): string {
	const httpBase = sessionApi.defaults.baseURL ?? window.location.origin;
	const url = new URL(httpBase, window.location.origin);
	url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	return url.toString().replace(/\/+$/, "");
}

function upsertMessage(
	queryClient: QueryClient,
	chatID: string,
	incoming: ChatMessage,
) {
	queryClient.setQueryData<InfiniteData<MessagePage>>(
		MessagesKey.chat(chatID),
		(old) => {
			if (!old || old.pages.length === 0) return old;

			const optimisticId = incoming.clientNonce
				? `optimistic-${incoming.clientNonce}`
				: null;

			let replaced = false;
			const pages = old.pages.map((page) => ({
				...page,
				messages: page.messages.map((m) => {
					if (
						m.id === incoming.id ||
						(optimisticId && m.id === optimisticId)
					) {
						replaced = true;
						return incoming;
					}
					return m;
				}),
			}));

			if (replaced) return { ...old, pages };

			// Genuinely new message from someone else — pages[0] holds the
			// newest messages (pagination pages backward via `before`),
			// so a live message always belongs at the front of page 0.
			const [latest, ...rest] = pages;
			return {
				...old,
				pages: [
					{ ...latest, messages: [incoming, ...latest.messages] },
					...rest,
				],
			};
		},
	);
}

function handleEnvelope(
	queryClient: QueryClient,
	chatID: string,
	envelope: WireEnvelope,
) {
	switch (envelope.type) {
		case ChatEventType.Message:
		case ChatEventType.Edit:
			upsertMessage(queryClient, chatID, envelope.payload as ChatMessage);
			return;
		case ChatEventType.Pin:
			// Assumes the server echoes the same shape h.pin returns over REST —
			// a full PinnedMessage. If the WS payload is slimmer, join it against
			// the messages cache here instead of casting directly.
			upsertPinnedMessage(
				queryClient,
				chatID,
				envelope.payload as PinnedMessage,
			);
			return;
		case ChatEventType.Unpin:
			removePinnedMessage(
				queryClient,
				chatID,
				(envelope.payload as { messageId: string }).messageId,
			);
			return;
		case ChatEventType.Read:
		case ChatEventType.Delete:
			const { messageId } = envelope.payload as { messageId: string };
			removeMessage(queryClient, chatID, messageId);
			removePinnedMessage(queryClient, chatID, messageId);
			markRepliesDeleted(queryClient, chatID, messageId);
			return;
	}
}

/** Owns the raw websocket connection for one chat: connect, reconnect
 * with backoff, route incoming events into the query cache, expose typed
 * senders for each wire action. */
export function useChatSocket(chatID: string) {
	const queryClient = useQueryClient();
	const [status, setStatus] = useState<ConnectionStatus>(
		ConnectionStatus.Connecting,
	);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectAttempt = useRef(0);
	const reconnectTimer = useRef<number | undefined>(undefined);
	const closedByUs = useRef(false);
	const refreshedThisCycle = useRef(false);

	useEffect(() => {
		closedByUs.current = false;
		reconnectAttempt.current = 0;

		async function connect() {
			setStatus(ConnectionStatus.Connecting);

			let reachedOpen = false;
			const ws = new WebSocket(`${wsBaseURL()}/ws/chats/${chatID}`);
			wsRef.current = ws;

			ws.onopen = () => {
				reachedOpen = true;
				reconnectAttempt.current = 0;
				refreshedThisCycle.current = false;
				setStatus(ConnectionStatus.Open);
			};

			ws.onmessage = (event) => {
				let envelope: WireEnvelope;
				try {
					envelope = JSON.parse(event.data);
				} catch {
					return;
				}
				handleEnvelope(queryClient, chatID, envelope);
			};

			ws.onclose = () => {
				setStatus(ConnectionStatus.Closed);
				if (closedByUs.current) return;

				// Closed without ever opening — with both tokens HttpOnly, this is
				// the only way we can detect "token was probably expired" at all.
				// Try one refresh, retry; if the refresh token's dead too, this
				// falls through to normal capped backoff below and the person
				// eventually needs to re-auth via whatever your app's global
				// 401-handling already does for REST calls.
				if (!reachedOpen && !refreshedThisCycle.current) {
					refreshedThisCycle.current = true;
					refreshTokens()
						.catch(() => {
							// Refresh token's dead too — nothing more to do here.
						})
						.finally(() => {
							reconnectTimer.current = window.setTimeout(
								connect,
								REFRESH_RETRY_DELAY_MS,
							);
						});
					return;
				}

				const delay = Math.min(
					RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempt.current,
					RECONNECT_MAX_DELAY_MS,
				);
				reconnectAttempt.current += 1;
				reconnectTimer.current = window.setTimeout(connect, delay);
			};

			ws.onerror = () => ws.close();
		}

		connect();

		return () => {
			closedByUs.current = true;
			window.clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, [chatID, queryClient]);

	const send = useCallback((action: OutgoingAction): boolean => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(action));
		return true;
	}, []);

	const sendMessage = useCallback(
		(
			body: string,
			opts?: {
				replyToId?: string;
				clientNonce?: string;
				mentionedUserIds?: string[];
			},
		) =>
			send({
				type: ChatEventType.Message,
				body,
				replyToId: opts?.replyToId,
				mentionedUserIds: opts?.mentionedUserIds,
				clientNonce: opts?.clientNonce,
			}),
		[send],
	);
	const sendEdit = useCallback(
		(messageId: string, body: string) =>
			send({ type: ChatEventType.Edit, messageId, body }),
		[send],
	);
	const sendPin = useCallback(
		(messageId: string) => send({ type: ChatEventType.Pin, messageId }),
		[send],
	);
	const sendUnpin = useCallback(
		(messageId: string) => send({ type: ChatEventType.Unpin, messageId }),
		[send],
	);
	const sendRead = useCallback(
		(lastReadMessageId: string) =>
			send({ type: ChatEventType.Read, messageId: lastReadMessageId }),
		[send],
	);
	const sendDelete = useCallback(
		(messageId: string) => send({ type: ChatEventType.Delete, messageId }),
		[send],
	);

	return {
		status,
		sendMessage,
		sendEdit,
		sendPin,
		sendUnpin,
		sendRead,
		sendDelete,
	};
}

/** Composer-facing send: socket when connected, REST fallback otherwise,
 * same optimistic-append UX either way. Reconciliation differs by path —
 * socket replies are matched by clientNonce (no real id exists yet when
 * we send), REST replies are matched by the mutation's own tempId. */
export function useComposerSend(chatID: string) {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const {
		status,
		sendMessage: sendViaSocket,
		sendEdit: sendEditViaSocket,
		sendPin: sendPinViaSocket,
		sendUnpin: sendUnpinViaSocket,
		sendDelete: sendDeleteViaSocket,
	} = useChatSocket(chatID);
	const restMutation = useSendMessageRest(chatID);
	const editMutation = useEditMessageMutation(chatID);
	const pinMutation = usePinMessageMutation(chatID);
	const unpinMutation = useUnpinMessageMutation(chatID);
	const deleteMutation = useDeleteMessageMutation(chatID);

	const send = useCallback(
		(body: string, replyTo?: ReplySnippet) => {
			if (status !== ConnectionStatus.Open) {
				restMutation.mutate({ body, replyTo });
				return;
			}

			const nonce = crypto.randomUUID();
			const tempId = `optimistic-${nonce}`;
			const optimistic: ChatMessage = {
				id: tempId,
				senderId: user?.id ?? "",
				body: body,
				createdAt: new Date().toISOString(),
				clientNonce: nonce,
				replyTo: replyTo,
			};

			upsertMessage(queryClient, chatID, optimistic);

			const sent = sendViaSocket(body, {
				replyToId: replyTo?.messageId,
				clientNonce: nonce,
			});
			if (!sent) {
				// Reported open but the send call itself failed synchronously
				// (rare) — drop the optimistic entry's socket path, retry REST.
				restMutation.mutate({ body, replyTo });
				return;
			}

			// Backend has no reject frame yet (see chatws.Client.handleMessage
			// — a rejected send is just logged and dropped). Without this,
			// a declined message sits in "sending" state forever.
			window.setTimeout(() => {
				queryClient.setQueryData<InfiniteData<MessagePage>>(
					MessagesKey.chat(chatID),
					(old) => {
						if (!old) return old;
						let stillPending = false;
						const pages = old.pages.map((page) => ({
							...page,
							messages: page.messages.map((m) => {
								if (m.id === tempId) {
									stillPending = true;
									return { ...m, failed: true };
								}
								return m;
							}),
						}));
						return stillPending ? { ...old, pages } : old;
					},
				);
			}, SEND_TIMEOUT_MS);
		},
		[status, sendViaSocket, restMutation, queryClient, chatID, user?.id],
	);

	const edit = useCallback(
		(messageId: string, body: string) => {
			const previous = findMessage(queryClient, chatID, messageId);
			if (previous)
				upsertMessage(queryClient, chatID, {
					...previous,
					body,
					editedAt: new Date().toISOString(),
				});

			if (
				status === ConnectionStatus.Open &&
				sendEditViaSocket(messageId, body)
			)
				return;

			editMutation.mutate(
				{ messageId, body },
				{
					onError: () => {
						if (previous)
							upsertMessage(queryClient, chatID, previous);
					},
				},
			);
		},
		[status, sendEditViaSocket, editMutation, queryClient, chatID],
	);

	const pin = useCallback(
		(message: ChatMessage) => {
			const optimisticPin: PinnedMessage = {
				messageId: message.id,
				pinned_by: user?.id ?? "",
				pinned_at: new Date().toISOString(),
				order_index: nextPinOrderIndex(queryClient, chatID),
			};
			upsertPinnedMessage(queryClient, chatID, optimisticPin);

			if (status === ConnectionStatus.Open) {
				const delivered = sendPinViaSocket(message.id);
				if (delivered) return; // server echoes a Pin envelope with the real pinned_by/pinned_at/order_index
			}

			pinMutation.mutate(message.id, {
				onSuccess: (pinned) =>
					upsertPinnedMessage(queryClient, chatID, pinned),
				onError: () =>
					removePinnedMessage(queryClient, chatID, message.id),
			});
		},
		[status, sendPinViaSocket, pinMutation, queryClient, chatID, user?.id],
	);

	const unpin = useCallback(
		(messageId: string) => {
			const removed = removePinnedMessage(queryClient, chatID, messageId);

			if (status === ConnectionStatus.Open) {
				const delivered = sendUnpinViaSocket(messageId);
				if (delivered) return;
			}

			unpinMutation.mutate(messageId, {
				onError: () => {
					if (removed)
						upsertPinnedMessage(queryClient, chatID, removed);
				},
			});
		},
		[status, sendUnpinViaSocket, unpinMutation, queryClient, chatID],
	);

	const deleteMessage = useCallback(
		(messageId: string) => {
			const removed = removeMessage(queryClient, chatID, messageId);
			const removedPin = removePinnedMessage(
				queryClient,
				chatID,
				messageId,
			);
			const affectedReplyIds = markRepliesDeleted(
				queryClient,
				chatID,
				messageId,
			);

			if (status === ConnectionStatus.Open) {
				const delivered = sendDeleteViaSocket(messageId);
				if (delivered) return;
			}

			deleteMutation.mutate(messageId, {
				onError: () => {
					if (removed) upsertMessage(queryClient, chatID, removed);
					if (removedPin)
						upsertPinnedMessage(queryClient, chatID, removedPin);
					markRepliesUndeleted(queryClient, chatID, affectedReplyIds);
				},
			});
		},
		[deleteMutation, queryClient, chatID],
	);

	const cancelFailed = useCallback(
		(messageId: string) => {
			removeMessage(queryClient, chatID, messageId);
		},
		[queryClient, chatID],
	);

	const retry = useCallback(
		(message: ChatMessage) => {
			// Drop the failed optimistic entry, then resend as a fresh
			// attempt (new tempId/nonce) — simpler and more correct than
			// trying to reuse the old id, since the old one may already
			// be tangled up in a stale timeout closure from the first
			// attempt.
			removeMessage(queryClient, chatID, message.id);
			send(message.body, message.replyTo);
		},
		[queryClient, chatID, send],
	);

	return {
		send,
		edit,
		pin,
		unpin,
		deleteMessage,
		retry,
		cancelFailed,
		isSocketConnected: status === ConnectionStatus.Open,
	};
}

function removeMessage(
	queryClient: QueryClient,
	chatID: string,
	messageId: string,
) {
	let removed: ChatMessage | undefined;
	queryClient.setQueryData<InfiniteData<MessagePage>>(
		MessagesKey.chat(chatID),
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					messages: page.messages.filter((m) => {
						if (m.id === messageId) {
							removed = m;
							return false;
						}
						return true;
					}),
				})),
			};
		},
	);
	return removed;
}

function nextPinOrderIndex(queryClient: QueryClient, chatID: string): number {
	const existing = queryClient.getQueryData<PinnedMessage[]>(
		PinnedMessagesKey.chat(chatID),
	);
	if (!existing || existing.length === 0) return 0;
	return Math.max(...existing.map((p) => p.order_index)) + 1;
}

function upsertPinnedMessage(
	queryClient: QueryClient,
	chatID: string,
	pinned: PinnedMessage,
) {
	queryClient.setQueryData<PinnedMessage[]>(
		PinnedMessagesKey.chat(chatID),
		(old) => {
			const existing = old ?? [];
			const next = existing.some((p) => p.messageId === pinned.messageId)
				? existing.map((p) =>
						p.messageId === pinned.messageId ? pinned : p,
					)
				: [...existing, pinned];
			return next.sort((a, b) => a.order_index - b.order_index);
		},
	);
}

function removePinnedMessage(
	queryClient: QueryClient,
	chatID: string,
	messageId: string,
): PinnedMessage | undefined {
	let removed: PinnedMessage | undefined;
	queryClient.setQueryData<PinnedMessage[]>(
		PinnedMessagesKey.chat(chatID),
		(old) => {
			if (!old) return old;
			removed = old.find((p) => p.messageId === messageId);
			return old.filter((p) => p.messageId !== messageId);
		},
	);
	return removed;
}

function markRepliesDeleted(
	queryClient: QueryClient,
	chatID: string,
	deletedMessageId: string,
): string[] {
	const affected: string[] = [];
	queryClient.setQueryData<InfiniteData<MessagePage>>(
		MessagesKey.chat(chatID),
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					messages: page.messages.map((m) => {
						if (
							m.replyTo &&
							m.replyTo.messageId === deletedMessageId &&
							!m.replyTo.deleted
						) {
							affected.push(m.id);
							return {
								...m,
								replyTo: { ...m.replyTo, deleted: true },
							};
						}
						return m;
					}),
				})),
			};
		},
	);
	return affected;
}

function markRepliesUndeleted(
	queryClient: QueryClient,
	chatID: string,
	messageIds: string[],
) {
	if (messageIds.length === 0) return;
	const idSet = new Set(messageIds);
	queryClient.setQueryData<InfiniteData<MessagePage>>(
		MessagesKey.chat(chatID),
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					messages: page.messages.map((m) =>
						idSet.has(m.id) && m.replyTo
							? {
									...m,
									replyTo: { ...m.replyTo, deleted: false },
								}
							: m,
					),
				})),
			};
		},
	);
}

function findMessage(
	queryClient: QueryClient,
	chatID: string,
	messageId: string,
) {
	return queryClient
		.getQueryData<InfiniteData<MessagePage>>(MessagesKey.chat(chatID))
		?.pages.flatMap((p) => p.messages)
		.find((m) => m.id === messageId);
}
