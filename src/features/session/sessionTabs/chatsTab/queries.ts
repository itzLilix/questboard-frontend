import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import {
	fetchChatPermissions,
	fetchChatsList,
	fetchMessages,
	sendMessage,
	type MessagePage,
} from "./api";
import type { ChatMessage, ReplySnippet } from "../../../../types/chat";
import useAuth from "../../../auth/AuthProvider";

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
};

export function useMessagesQuery(chatID: string) {
	return useInfiniteQuery({
		queryKey: MessagesKey.chat(chatID),
		queryFn: ({ pageParam }) =>
			fetchMessages(chatID, { before: pageParam }),
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

export function useSendMessageMutation(chatID: string) {
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
