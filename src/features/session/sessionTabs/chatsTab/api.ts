import { sessionApi } from "../../../../api/axios";
import type {
	ChatMessage,
	ChatPermissions,
	ChatSummary,
	PinnedMessage,
} from "../../../../types/chat";

export async function fetchChatsList(
	sessionID: string,
): Promise<ChatSummary[]> {
	const { data } = await sessionApi.get<ChatSummary[]>(
		`/sessions/${sessionID}/chats`,
	);
	return data;
}

// --- messages ---------------------------------------------------------------

export interface MessagePage {
	messages: ChatMessage[];
	nextCursor?: string;
	hasMore: boolean;
}

export async function fetchMessages(
	chatID: string,
	params?: { before?: string; limit?: number },
): Promise<MessagePage> {
	const { data } = await sessionApi.get<MessagePage>(
		`/chats/${chatID}/messages`,
		{ params },
	);
	return data;
}

export type SendMessageBody = {
	body: string;
	replyToId?: string;
	attachments?: {
		fileName: string;
		url: string;
		mimeType?: string;
		sizeBytes?: number;
	}[];
};

export async function sendMessage(
	chatID: string,
	body: SendMessageBody,
): Promise<ChatMessage> {
	const { data } = await sessionApi.post<ChatMessage>(
		`/chats/${chatID}/messages`,
		body,
	);
	return data;
}

export async function fetchChatPermissions(
	chatID: string,
): Promise<ChatPermissions> {
	const { data } = await sessionApi.get<ChatPermissions>(
		`/chats/${chatID}/permissions`,
	);
	return data;
}

export async function editMessageRest(
	chatID: string,
	messageId: string,
	body: string,
): Promise<ChatMessage> {
	const { data } = await sessionApi.patch<ChatMessage>(
		`/chats/${chatID}/messages/${messageId}`,
		{ body },
	);
	return data;
}

// Route exists but nothing in the UI calls it yet — the "Удалить"
// MessageAction is still a no-op. Wire this in when that's ready.
export async function deleteMessageRest(
	chatID: string,
	messageId: string,
): Promise<void> {
	await sessionApi.delete(`/chats/${chatID}/messages/${messageId}`);
}

export async function fetchPinnedMessages(
	chatID: string,
): Promise<PinnedMessage[]> {
	const { data } = await sessionApi.get<PinnedMessage[]>(
		`/chats/${chatID}/pins`,
	);
	return data;
}

export async function fetchMessageById(
	chatID: string,
	messageId: string,
): Promise<ChatMessage> {
	const { data } = await sessionApi.get<ChatMessage>(
		`/chats/${chatID}/messages/${messageId}`,
	);
	return data;
}

export async function pinMessageRest(
	chatID: string,
	messageId: string,
): Promise<PinnedMessage> {
	const { data } = await sessionApi.post<PinnedMessage>(
		`/chats/${chatID}/pins/${messageId}`,
	);
	return data;
}

export async function unpinMessageRest(
	chatID: string,
	messageId: string,
): Promise<void> {
	await sessionApi.delete(`/chats/${chatID}/pins/${messageId}`);
}
