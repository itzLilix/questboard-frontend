import { sessionApi } from "../../../../api/axios";
import type {
	ChatMessage,
	ChatPermissions,
	ChatSummary,
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

// Mirrors dtos.ReplySnippet exactly — resolved server-side.
export interface ApiReplySnippet {
	messageId: string;
	senderId: string;
	contentPreview?: string;
	deleted?: boolean;
}

export interface ApiAttachment {
	id: string;
	fileName: string;
	url: string;
	mimeType: string;
	sizeBytes: number;
}

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
