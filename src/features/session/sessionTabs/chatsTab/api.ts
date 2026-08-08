import { sessionApi } from "../../../../api/axios";
import type { ChatSummary } from "../../../../types/chat";

export async function fetchChatsList(
	sessionID: string,
): Promise<ChatSummary[]> {
	const { data } = await sessionApi.get<ChatSummary[]>(
		`/sessions/${sessionID}/chats`,
	);
	return data;
}
