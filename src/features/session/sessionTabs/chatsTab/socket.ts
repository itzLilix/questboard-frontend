import { useCallback, useEffect, useRef, useState } from "react";
import {
	useQueryClient,
	type InfiniteData,
	type QueryClient,
} from "@tanstack/react-query";
import { sessionApi } from "../../../../api/axios";
import { MessagesKey, useSendMessageMutation } from "./queries";
import type { MessagePage, SendMessageBody } from "./api";
import useAuth from "../../../auth/AuthProvider";
import type { ChatMessage, ReplySnippet } from "../../../../types/chat";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;
const SEND_TIMEOUT_MS = 8000;

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
	Delete: "delete", // not emitted by the backend yet (see events.go) — defined
	// so a future server-side add "just works" here without another round trip
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
		case ChatEventType.Unpin:
		case ChatEventType.Read:
		case ChatEventType.Delete:
			// No pin state, read-receipt, or delete UI yet — nothing to
			// reconcile. Add a case here the same way message/edit is
			// handled above once there's a UI consumer.
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

	useEffect(() => {
		closedByUs.current = false;
		reconnectAttempt.current = 0;

		function connect() {
			setStatus(ConnectionStatus.Connecting);
			const ws = new WebSocket(`${wsBaseURL()}/ws/chats/${chatID}`);
			wsRef.current = ws;

			ws.onopen = () => {
				reconnectAttempt.current = 0;
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
				// Note: a permanent 403 (not a member, e.g.) and a dropped
				// connection look identical to the browser here — both just
				// fire close. This will retry a rejected chat forever with
				// capped backoff rather than surfacing "you don't have
				// access." Fine for now; revisit if that's confusing in
				// practice.
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
	// Backend's readPump ignores unknown event types today (see client.go's
	// `default:` case) rather than erroring — so this is safe to wire up
	// now; it'll go from silently ignored to functional whenever the
	// backend adds a case for it, no client change needed.
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
	const { status, sendMessage: sendViaSocket } = useChatSocket(chatID);
	const restMutation = useSendMessageMutation(chatID);

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

			queryClient.setQueryData<InfiniteData<MessagePage>>(
				MessagesKey.chat(chatID),
				(old) => {
					if (!old || old.pages.length === 0) return old;
					const [latest, ...rest] = old.pages;
					return {
						...old,
						pages: [
							{
								...latest,
								messages: [optimistic, ...latest.messages],
							},
							...rest,
						],
					};
				},
			);

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
	queryClient.setQueryData<InfiniteData<MessagePage>>(
		MessagesKey.chat(chatID),
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					messages: page.messages.filter((m) => m.id !== messageId),
				})),
			};
		},
	);
}
