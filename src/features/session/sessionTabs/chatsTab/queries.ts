import {
	useInfiniteQuery,
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import {
	deleteMessageRest,
	editMessageRest,
	fetchChatPermissions,
	fetchChatsList,
	fetchMessageById,
	fetchMessages,
	fetchPinnedMessages,
	pinMessageRest,
	sendMessage,
	unpinMessageRest,
	type MessagePage,
} from "./api";
import type { ChatMessage, ReplySnippet } from "../../../../types/chat";
import useAuth from "../../../auth/AuthProvider";
import { useEffect } from "react";

export const ChatsListKey = {
	all: ["chats"] as const,
	session: (sessionID: string) =>
		[...ChatsListKey.all, "session", sessionID] as const,
};

export function useFetchChatsListQuery(sessionID: string) {
	return useQuery({
		queryKey: ChatsListKey.session(sessionID),
		queryFn: () => fetchChatsList(sessionID),
		enabled: !!sessionID,
	});
}

// --- messages ---------------------------------------------------------------

export const MessagesKey = {
	all: ["messages"] as const,
	chat: (chatID: string) => [...MessagesKey.all, "chat", chatID] as const,
	one: (chatID: string, id: string) =>
		[...MessagesKey.chat(chatID), "one", id] as const,
};

export function useMessagesQuery(chatID: string) {
	const queryClient = useQueryClient();
	return useInfiniteQuery({
		queryKey: MessagesKey.chat(chatID),
		queryFn: async ({ pageParam }) => {
			const page = await fetchMessages(chatID, { before: pageParam });
			page.messages.forEach((m) =>
				queryClient.setQueryData(MessagesKey.one(chatID, m.id), m),
			);
			return page;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.hasMore ? lastPage.nextCursor : undefined,
		enabled: !!chatID,
		select: (data) => ({
			pageParams: data.pageParams,
			pages: data.pages,
			messages: data.pages.flatMap((p) => p.messages),
		}),
	});
}

export function useResolveMessages(
	chatID: string,
	ids: string[],
	seed?: Record<string, ChatMessage>,
) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!seed) return;
		Object.values(seed).forEach((m) =>
			queryClient.setQueryData(MessagesKey.one(chatID, m.id), m),
		);
	}, [seed, chatID, queryClient]);

	return useQueries({
		queries: ids.map((id) => ({
			queryKey: MessagesKey.one(chatID, id),
			queryFn: () => fetchMessageById(chatID, id), // fallback; rarely hits network since seed/scroll usually beat it
			initialData: seed?.[id],
			staleTime: Infinity,
		})),
	});
}

export function useMessage(chatId: string, id?: string) {
	const [result] = useResolveMessages(chatId, id ? [id] : []);
	return result?.data;
}

export function useSendMessageRest(chatID: string) {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	return useMutation({
		mutationFn: ({
			body,
			replyTo,
		}: {
			body: string;
			replyTo?: ReplySnippet;
		}) => sendMessage(chatID, { body, replyToId: replyTo?.messageId }),

		onMutate: async ({ body, replyTo }) => {
			await queryClient.cancelQueries({
				queryKey: MessagesKey.chat(chatID),
			});
			const previous = queryClient.getQueryData<
				InfiniteData<MessagePage>
			>(MessagesKey.chat(chatID));

			const tempId = `optimistic-${crypto.randomUUID()}`;
			const optimistic: ChatMessage = {
				id: tempId,
				senderId: user?.id ?? "",
				body: body,
				replyTo: replyTo,
				createdAt: new Date().toISOString(),
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

			return { previous, tempId };
		},

		onError: (_err, _body, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					MessagesKey.chat(chatID),
					context.previous,
				);
			}
		},

		onSuccess: (saved, _body, context) => {
			queryClient.setQueryData<InfiniteData<MessagePage>>(
				MessagesKey.chat(chatID),
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							messages: page.messages.map((m) =>
								m.id === context?.tempId ? saved : m,
							),
						})),
					};
				},
			);
		},
	});
}

export const ChatPermissionsKey = {
	all: ["chatPermissions"] as const,
	chat: (chatID: string) =>
		[...ChatPermissionsKey.all, "chat", chatID] as const,
};

export function usePermissionsQuery(chatID: string) {
	return useQuery({
		queryKey: ChatPermissionsKey.chat(chatID),
		queryFn: () => fetchChatPermissions(chatID),
		enabled: !!chatID,
		// Permissions change rarely and there's no role-management UI
		// yet to trigger a change mid-session — avoid refetching on
		// every window focus. Revisit (shorter staleTime or explicit
		// invalidation) once role/permission editing exists.
		staleTime: 5 * 60 * 1000,
	});
}

export const PinnedMessagesKey = {
	chat: (chatID: string) => ["chat", chatID, "pinnedMessages"] as const,
};

export function usePinnedMessagesQuery(chatID: string) {
	return useQuery({
		queryKey: PinnedMessagesKey.chat(chatID),
		queryFn: () => fetchPinnedMessages(chatID),
	});
}

// Fallback-only — on the socket-open path useComposerSend patches the
// cache directly (patchMessage/upsertPinnedMessage/removePinnedMessage in
// socket.ts) and only falls back to these mutations when the socket is
// down or the send call itself failed synchronously.
export function useEditMessageMutation(chatID: string) {
	return useMutation({
		mutationFn: ({
			messageId,
			body,
		}: {
			messageId: string;
			body: string;
		}) => editMessageRest(chatID, messageId, body),
	});
}

export function usePinMessageMutation(chatID: string) {
	return useMutation({
		mutationFn: (messageId: string) => pinMessageRest(chatID, messageId),
	});
}

export function useUnpinMessageMutation(chatID: string) {
	return useMutation({
		mutationFn: (messageId: string) => unpinMessageRest(chatID, messageId),
	});
}

export function useDeleteMessageMutation(chatID: string) {
	return useMutation({
		mutationFn: (messageId: string) => deleteMessageRest(chatID, messageId),
	});
}
