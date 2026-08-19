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

export type ChatMessageAttachment = {
	id: string;
	messageId: string;
	name: string;
	url: string;
	mimeType: string;
	sizeBytes: number;
};

export const ChatRole = {
	Owner: "owner",
	Admin: "admin",
	Member: "member",
} as const;

export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export type ChatMember = {
	UserId: string;
	Role: ChatRole;
	JoinedAt: string;
	LastReadId?: string;
};

export type ReplySnippet = {
	messageId: string;
	senderId: string;
	contentPreview?: string;
	deleted?: boolean;
};

export type MessageAttachment = {
	id: string;
	fileName: string;
	url: string;
	mimeType: string;
	sizeBytes: number;
};

export type ChatMessage = {
	id: string;
	senderId: string;
	body: string;
	replyTo?: ReplySnippet;
	attachments?: MessageAttachment[];
	mentionedUserIds?: string[];
	createdAt: string;
	editedAt?: string;
	failed?: boolean;
	pending?: boolean;
	clientNonce?: string;
};

export type ChatPermissions = {
	role: ChatRole;
	canSendMessages: boolean;
	canSendFiles: boolean;
	canPinMessages: boolean;
	canChangeInfo: boolean;
	canAddMembers: boolean;
	canRemoveMembers: boolean;
	canDeleteMessages: boolean;
	canManageRoles: boolean;
	canManagePermissions: boolean;
};

export type PinnedMessage = {
	messageId: string;
	pinned_by: string;
	pinned_at: string;
	order_index: number;
};
