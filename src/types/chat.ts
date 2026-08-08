export const ChatKind = {
	General: "general",
	DM: "dm",
	Group: "group",
} as const;

export type ChatKind = (typeof ChatKind)[keyof typeof ChatKind];

export type ChatSummary = {
	id: string;
	sessionId?: string;
	campaignId?: string;
	kind: ChatKind;
	title: string;
	pictureUrl?: string;
	archivedAt?: string;
	lastMessageAt?: string;
	createdAt: string;
	otherUserId?: string;
	lastMessage?: ChatLastMessage;
};

export function getChatTitle(chat: ChatSummary): string {
	const title = chat.title?.trim();
	if (title) return title;
	return chat.kind === ChatKind.General ? "Общий чат" : "Чат без названия";
}

export type ChatLastMessage = {
	senderId: string;
	body: string;
	hasAttachment: boolean;
};

export type ChatMessage = {
	id: string;
	chatId: string;
	senderId: string;
	body: string;
	replyToId?: string;
	createdAt: string;
	editedAt?: string;
	deletedAt?: string;
	attachments?: ChatMessageAttachment[];
	mentions?: ChatMessageMention[];
};

export type ChatMessageAttachment = {
	id: string;
	messageId: string;
	name: string;
	url: string;
	mimeType: string;
	sizeBytes: number;
};

export type ChatMessageMention = {
	messageId: string;
	mentionedUserId: string;
};

export const ChatMemberRole = {
	Owner: "owner",
	Admin: "admin",
	Member: "member",
} as const;

export type ChatMemberRole =
	(typeof ChatMemberRole)[keyof typeof ChatMemberRole];

export type ChatMember = {
	UserId: string;
	Role: ChatMemberRole;
	JoinedAt: string;
	LastReadId?: string;
};
