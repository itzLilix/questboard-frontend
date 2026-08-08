import { useQuery } from "@tanstack/react-query";
import { fetchChatsList } from "./api";

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
