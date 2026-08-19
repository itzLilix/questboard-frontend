import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import AddButton from "../../../../components/ui/AddButton";
import AvatarImage from "../../../../components/ui/AvatarImage";
import Icon from "../../../../components/ui/Icon";
import { useSessionRole } from "../../SessionContext";
import type { IUserBrief } from "../../../../types/userCard";
import {
	ChatKind,
	getChatTitle,
	type ChatSummary,
	type ChatMessage,
	type ReplySnippet,
	type ChatPermissions,
	type PinnedMessage,
} from "../../../../types/chat";
import {
	useFetchChatsListQuery,
	useMessage,
	useMessagesQuery,
	usePermissionsQuery,
	usePinnedMessagesQuery,
	useResolveMessages,
} from "./queries";
import useAuth from "../../../auth/AuthProvider";
import { useComposerSend } from "./socket";
import EmptyState from "../../../../components/ui/EmptyState";
import CreateGroupChatModal, {
	type CreateGroupChatData,
} from "./CreateChatModal";
import CloseButton from "../../../../components/ui/CloseButton";
import { useInView } from "react-intersection-observer";

type ChatData = {
	users: Record<string, IUserBrief>;
	currentUserId?: string;
};

const ChatDataContext = createContext<ChatData | null>(null);

function useChatData(): ChatData {
	const ctx = useContext(ChatDataContext);
	if (!ctx)
		throw new Error("useChatData must be used within ChatDataContext");
	return ctx;
}

const CurrentChatContext = createContext<string | null>(null);
function useCurrentChatId(): string {
	const ctx = useContext(CurrentChatContext);
	if (!ctx)
		throw new Error("useCurrentChatId must be used within Conversation");
	return ctx;
}

function displayNameOf(users: Record<string, IUserBrief>, id: string): string {
	return users[id]?.displayName ?? "неизвестный";
}

function formatMessageTime(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ChatTab() {
	const { sessionData } = useSessionRole();
	const { user } = useAuth();
	const users = sessionData.users;
	const currentUserId = user?.id;

	const { data: chats } = useFetchChatsListQuery(sessionData.session.id);
	const fetchedChats = chats ?? [];

	const [searchParams, setSearchParams] = useSearchParams();
	const paramChatId = searchParams.get("c");
	const active = fetchedChats.find((c) => c.id === paramChatId) ?? null;

	const selectChat = (id: string) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("c", id);
				return next;
			},
			{ replace: false },
		);
	};

	const data = useMemo<ChatData>(
		() => ({ users, currentUserId }),
		[users, currentUserId],
	);

	return (
		<ChatDataContext.Provider value={data}>
			<div className="flex gap-4 h-full min-h-0">
				<ChatList
					chats={fetchedChats}
					activeId={active?.id}
					onSelect={selectChat}
				/>
				{active ? (
					<Conversation chat={active} />
				) : (
					<EmptyState
						text="Выберите чат"
						className="flex-1"
					></EmptyState>
				)}
			</div>
		</ChatDataContext.Provider>
	);
}

function ChatList({
	chats,
	activeId,
	onSelect,
}: {
	chats: ChatSummary[];
	activeId?: string;
	onSelect: (id: string) => void;
}) {
	const { users, currentUserId } = useChatData();
	const [createOpen, setCreateOpen] = useState(false);

	const handleCreate = (data: CreateGroupChatData) => {
		console.log(data);

		// TODO: call create-group-chat API
		// await createGroupChat(data);

		setCreateOpen(false);
	};

	return (
		<div className="w-1/3 min-w-0 flex flex-col gap-3 overflow-y-auto pr-1">
			{chats.map((chat) => (
				<ChatListItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === activeId}
					onClick={() => onSelect(chat.id)}
				/>
			))}

			<AddButton
				className="self-center mt-1"
				onClick={() => setCreateOpen(true)}
			/>

			{createOpen && (
				<CreateGroupChatModal
					users={users}
					currentUserId={currentUserId}
					onClose={() => setCreateOpen(false)}
					onCreate={handleCreate}
				/>
			)}
		</div>
	);
}

function ChatListItem({
	chat,
	isActive,
	onClick,
}: {
	chat: ChatSummary;
	isActive: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"text-left rounded-xl p-4 border bg-(--bg-card) flex items-center gap-3 transition-colors relative cursor-pointer ml-3",
				isActive
					? "text-(--text-primary) border-(--accent) before:absolute before:inset-y-0 before:-left-3 before:w-1 before:bg-(--accent) before:rounded-lg"
					: "text-(--text-primary) border-(--border) hover:bg-(--bg-elevated)",
			)}
		>
			<ChatAvatar chat={chat} />
			<div className="min-w-0 flex-1">
				<p className="truncate text-(--text-primary)">
					{getChatTitle(chat)}
				</p>
				<ChatPreview chat={chat} />
			</div>
		</button>
	);
}

function ChatPreview({ chat }: { chat: ChatSummary }) {
	const { users, currentUserId } = useChatData();
	const last = chat.lastMessage;
	if (!last) {
		return (
			<p className="truncate text-sm text-(--text-secondary)">
				Нет сообщений
			</p>
		);
	}
	const isDirect = chat.kind === ChatKind.DM;
	const sender =
		last.senderId === currentUserId
			? "Вы"
			: isDirect
				? null
				: displayNameOf(users, last.senderId);

	return (
		<p className="truncate text-sm text-(--text-secondary)">
			{sender && (
				<span className="text-(--text-secondary) font-bold">
					{sender}:{" "}
				</span>
			)}
			{last.body}
		</p>
	);
}

function ChatAvatar({ chat }: { chat: ChatSummary }) {
	const { users } = useChatData();
	if (chat.pictureUrl) {
		return (
			<div className="shrink-0">
				<AvatarImage
					src={chat.pictureUrl}
					alt={getChatTitle(chat)}
					size="md"
				/>
			</div>
		);
	}
	if (chat.kind === ChatKind.General) {
		return (
			<div className="w-10 h-10 shrink-0 rounded-full bg-(--bg-elevated) border border-(--border) flex items-center justify-center text-(--accent)">
				<Icon name={"groups"} className="text-xl!" />
			</div>
		);
	}
	if (chat.otherUserId) {
		return (
			<div className="shrink-0">
				<AvatarImage
					src={users[chat.otherUserId]?.avatarUrl}
					alt={chat.title}
					size="md"
				/>
			</div>
		);
	}
}

function Conversation({ chat }: { chat: ChatSummary }) {
	const messagesQuery = useMessagesQuery(chat.id);
	const messages = messagesQuery.data?.messages ?? [];
	const sortedMessages = useMemo(() => {
		const isPending = (m: ChatMessage) => m.id.startsWith("optimistic-");
		const confirmed = messages
			.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() -
					new Date(b.createdAt).getTime(),
			)
			.filter((m) => !isPending(m));
		const pending = messages.filter(isPending);
		pending.forEach((m) => (m.pending = true));
		return [...confirmed, ...pending];
	}, [messages]);
	const messageById = useMemo(
		() => Object.fromEntries(messages.map((m) => [m.id, m])),
		[messages],
	);

	const { data: permissions } = usePermissionsQuery(chat.id);
	const { send, retry, cancelFailed, edit, pin, unpin, deleteMessage } =
		useComposerSend(chat.id);

	const { data: pinnedMessages = [] } = usePinnedMessagesQuery(chat.id);
	const pinnedIds = useMemo(
		() => new Set(pinnedMessages.map((m) => m.messageId)),
		[pinnedMessages],
	);

	const rowRefs = useRef(new Map<string, HTMLDivElement>());
	const scrollRef = useRef<HTMLDivElement>(null);
	const { ref: viewRef, inView } = useInView({ rootMargin: "300px 0px" });
	const [flashId, setFlashId] = useState<string | null>(null);
	const [replyTarget, setReplyTarget] = useState<ReplySnippet | undefined>(
		undefined,
	);
	const [editTarget, setEditTarget] = useState<ChatMessage | undefined>(
		undefined,
	);

	const prevChatIdRef = useRef(chat.id);
	const lastMessageIdRef = useRef<string | undefined>(undefined);

	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const newestId = sortedMessages.at(-1)?.id;
		const chatChanged = prevChatIdRef.current !== chat.id;
		const newestChanged = newestId !== lastMessageIdRef.current;
		if (chatChanged || newestChanged) {
			el.scrollTop = el.scrollHeight;
		}
		prevChatIdRef.current = chat.id;
		lastMessageIdRef.current = newestId;
	}, [chat.id, sortedMessages]);

	useEffect(() => {
		if (
			inView &&
			messagesQuery.hasNextPage &&
			!messagesQuery.isFetchingNextPage
		) {
			messagesQuery.fetchNextPage();
		}
	}, [
		inView,
		messagesQuery.hasNextPage,
		messagesQuery.isFetchingNextPage,
		messagesQuery.fetchNextPage,
	]);

	useEffect(() => {
		if (editTarget && !sortedMessages.some((m) => m.id === editTarget.id)) {
			setEditTarget(undefined);
		}
	}, [sortedMessages, editTarget]);

	useEffect(() => {
		if (
			replyTarget &&
			!sortedMessages.some((m) => m.id === replyTarget.messageId)
		) {
			setReplyTarget(undefined);
		}
	}, [sortedMessages, replyTarget]);

	const jumpToMessage = (id: string) => {
		const el = rowRefs.current.get(id);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "center" });
		setFlashId(id);
		window.setTimeout(
			() => setFlashId((cur) => (cur === id ? null : cur)),
			1200,
		);
	};

	const handleReply = (message: ChatMessage) => {
		setEditTarget(undefined);
		setReplyTarget({
			messageId: message.id,
			senderId: message.senderId,
			contentPreview: message.body.slice(0, 200),
		});
	};

	const handleEdit = (message: ChatMessage) => {
		setReplyTarget(undefined);
		setEditTarget(message);
	};

	const handlePinToggle = (message: ChatMessage) => {
		if (pinnedIds.has(message.id)) {
			unpin(message.id);
		} else {
			pin(message);
		}
	};

	const handleDelete = (id: string) => {
		if (replyTarget?.messageId === id) setReplyTarget(undefined);
		if (editTarget?.id === id) setEditTarget(undefined);
		deleteMessage(id);
	};

	return (
		<CurrentChatContext.Provider value={chat.id}>
			<div className="flex-1 min-w-0 flex flex-col bg-(--bg-card) border border-(--border) rounded-xl">
				<header className="flex items-center gap-3 px-4 outline outline-(--border) rounded-xl h-14 z-2">
					{<ChatAvatar chat={chat} />}
					<span className="text-(--text-primary) truncate">
						{getChatTitle(chat)}
					</span>
				</header>

				<PinnedBar
					pinnedMessages={pinnedMessages}
					chatId={chat.id}
					messages={messageById}
					onJump={jumpToMessage}
					onUnpin={unpin}
					canUnpin={permissions?.canPinMessages ?? false}
				/>

				<div
					ref={scrollRef}
					className="flex-1 min-h-0 overflow-y-scroll p-2"
				>
					<div className="flex flex-col justify-end min-h-full gap-1">
						{messagesQuery.hasNextPage && (
							<div ref={viewRef} className="h-1" />
						)}
						{sortedMessages.map((m) => (
							<MessageRow
								key={m.id}
								message={m}
								flash={flashId === m.id}
								isPinned={pinnedIds.has(m.id)}
								permissions={permissions}
								onJump={jumpToMessage}
								onReply={handleReply}
								onEdit={handleEdit}
								onPinToggle={handlePinToggle}
								onDelete={handleDelete}
								onRetry={retry}
								onCancel={cancelFailed}
								registerRef={(el) => {
									if (el) rowRefs.current.set(m.id, el);
									else rowRefs.current.delete(m.id);
								}}
							/>
						))}
					</div>
				</div>

				<Composer
					send={send}
					editMessage={edit}
					permissions={permissions}
					replyTarget={replyTarget}
					editTarget={editTarget}
					onCancelReply={() => setReplyTarget(undefined)}
					onCancelEdit={() => setEditTarget(undefined)}
					onSent={() => setReplyTarget(undefined)}
				/>
			</div>
		</CurrentChatContext.Provider>
	);
}

function MessageRow({
	message,
	permissions,
	flash,
	isPinned,
	onJump,
	onReply,
	onEdit,
	onPinToggle,
	onDelete,
	onRetry,
	onCancel,
	registerRef,
}: {
	message: ChatMessage;
	permissions?: ChatPermissions;
	flash?: boolean;
	isPinned?: boolean;
	onJump: (id: string) => void;
	onReply: (message: ChatMessage) => void;
	onEdit: (message: ChatMessage) => void;
	onPinToggle: (message: ChatMessage) => void;
	onDelete: (messageId: string) => void;
	onRetry: (message: ChatMessage) => void;
	onCancel: (messageId: string) => void;
	registerRef?: (el: HTMLDivElement | null) => void;
}) {
	const { users, currentUserId } = useChatData();
	const sender = users[message.senderId];
	const replyTo = message.replyTo?.deleted ? undefined : message.replyTo;

	const isOwn = message.senderId === currentUserId;
	const failed = !!message.failed;
	const pending = !!message.pending;

	const canReply = permissions?.canSendMessages ?? true;
	const canEdit = isOwn;
	const canPin = permissions?.canPinMessages ?? false;
	const canDelete = isOwn || (permissions?.canDeleteMessages ?? false);

	return (
		<div
			ref={registerRef}
			className={clsx(
				"group relative flex gap-3 p-2 rounded-xl transition-colors",
				flash
					? "bg-(--bg-elevated) ring-2 ring-(--accent)"
					: "bg-(--bg-card) hover:bg-(--bg-elevated)",
				pending && !message.failed && "opacity-30",
			)}
		>
			<MessageActions
				failed={failed}
				pending={pending}
				isPinned={isPinned}
				canReply={canReply}
				canEdit={canEdit}
				canPin={canPin}
				canDelete={canDelete}
				onReply={() => onReply(message)}
				onEdit={() => onEdit(message)}
				onPinToggle={() => onPinToggle(message)}
				onDelete={() => onDelete(message.id)}
				onRetry={() => onRetry(message)}
				onCancel={() => onCancel(message.id)}
			/>
			<div className="shrink-0">
				<AvatarImage
					src={sender?.avatarUrl}
					alt={sender?.username ?? "?"}
					size="md"
				/>
			</div>
			<div className="flex flex-col gap-1 w-full">
				<p className="text-base flex items-baseline gap-2 flex-wrap">
					<Link
						className="text-(--text-primary) font-bold hover:underline"
						to={"/users/" + users[message.senderId].username}
					>
						{displayNameOf(users, message.senderId)}
					</Link>
					<span className="text-(--text-muted) text-sm">
						{formatMessageTime(message.createdAt)}
					</span>
					{message.editedAt && (
						<span className="text-(--text-muted) text-sm">
							· изменено
						</span>
					)}
					{isPinned && (
						<Icon
							name="push_pin"
							className="text-sm! text-(--text-muted)"
						/>
					)}
					{message.failed && (
						<span className="text-(--error) text-sm">
							· не доставлено
						</span>
					)}
				</p>
				<ReplyPreview
					replyTo={replyTo}
					onJump={onJump}
					users={users}
					deleted={!!message.replyTo?.deleted}
				/>
				<p className="text-(--text-primary) wrap-break-word text-base">
					{message.body}
				</p>
			</div>
		</div>
	);
}

function ReplyPreview({
	replyTo,
	onJump,
	users,
	deleted,
}: {
	replyTo?: ReplySnippet;
	onJump?: (id: string) => void;
	users: Record<string, IUserBrief>;
	deleted?: boolean;
}) {
	const chatId = useCurrentChatId();
	const replyToMessage = useMessage(chatId, replyTo?.messageId);

	if (deleted) {
		return (
			<div className="text-left text-base text-(--text-secondary) w-full border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors hover:text-(--accent)">
				<span className="text-(--text-secondary)">
					Сообщение удалено
				</span>
			</div>
		);
	}
	if (!replyTo) return null;

	return (
		<button
			type="button"
			onClick={() => onJump?.(replyTo.messageId)}
			className="text-left text-base text-(--text-secondary) w-full border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors hover:text-(--accent)"
		>
			<span className="font-bold flex flex-col gap-1">
				{displayNameOf(users, replyTo.senderId)}
			</span>
			<span className="text-(--text-secondary)">
				{replyToMessage?.body.slice(0, 200) ?? replyTo.contentPreview}
			</span>
		</button>
	);
}

function MessageActions({
	failed,
	pending,
	isPinned,
	canReply,
	canEdit,
	canPin,
	canDelete,
	onReply,
	onEdit,
	onPinToggle,
	onDelete,
	onRetry,
	onCancel,
}: {
	failed: boolean;
	pending: boolean;
	isPinned?: boolean;
	canReply?: boolean;
	canEdit?: boolean;
	canPin?: boolean;
	canDelete?: boolean;
	onReply: () => void;
	onEdit: () => void;
	onPinToggle: () => void;
	onDelete: () => void;
	onRetry: () => void;
	onCancel: () => void;
}) {
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	if (confirmingDelete) {
		return (
			<div className="absolute -top-3 right-3 flex items-center gap-1 rounded-lg border border-(--error) bg-(--bg-surface) px-1.5 py-0.5">
				<span className="text-xs text-(--error) whitespace-nowrap">
					Удалить?
				</span>
				<MessageAction
					icon="check"
					label="Подтвердить удаление"
					className="hover:text-(--error)!"
					action={() => {
						onDelete();
						setConfirmingDelete(false);
					}}
				/>
				<MessageAction
					icon="close"
					label="Отмена"
					action={() => setConfirmingDelete(false)}
				/>
			</div>
		);
	}

	return (
		<div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-lg border border-(--border) bg-(--bg-surface) px-1 py-0.5 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
			{failed && (
				<MessageAction
					icon="refresh"
					label="Повторить"
					action={onRetry}
				/>
			)}
			{(pending || failed) && (
				<MessageAction
					icon="delete"
					label="Отменить"
					action={onCancel}
					className="hover:text-(--error)!"
				/>
			)}
			{!failed && !pending && (
				<>
					{canReply && (
						<MessageAction
							icon="reply"
							label="Ответить"
							action={onReply}
						/>
					)}
					{canEdit && (
						<MessageAction
							icon="edit"
							label="Изменить"
							action={onEdit}
						/>
					)}
					{canPin && (
						<MessageAction
							icon={isPinned ? "keep_off" : "push_pin"}
							label={isPinned ? "Открепить" : "Закрепить"}
							action={onPinToggle}
						/>
					)}
					{canDelete && (
						<MessageAction
							icon="delete"
							label="Удалить"
							action={() => setConfirmingDelete(true)}
							className="hover:text-(--error)!"
						/>
					)}
				</>
			)}
		</div>
	);
}

function MessageAction({
	icon,
	label,
	className,
	action,
}: {
	icon: string;
	label: string;
	className?: string;
	action?: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			className={clsx(
				"text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors cursor-pointer flex items-center justify-center p-1 rounded-md",
				className,
			)}
			onClick={action}
		>
			<Icon name={icon} className="text-lg!" />
		</button>
	);
}

type ComposerButtonProps = {
	icon: string;
	label: string;
	onClick: () => void;
	className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function ComposerButton({
	icon,
	label,
	onClick,
	className,
	disabled,
}: ComposerButtonProps) {
	return (
		<button
			type="button"
			className={clsx(
				"text-(--accent) hover:text-(--accent-hover) transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-default",
				className,
			)}
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			title={label}
		>
			<Icon name={icon} />
		</button>
	);
}

function Composer({
	send,
	editMessage,
	permissions,
	replyTarget,
	editTarget,
	onCancelReply,
	onCancelEdit,
	onSent,
}: {
	send: (body: string, replyTo?: ReplySnippet | undefined) => void;
	editMessage: (messageId: string, body: string) => void;
	permissions?: ChatPermissions;
	replyTarget?: ReplySnippet;
	editTarget?: ChatMessage;
	onCancelReply: () => void;
	onCancelEdit: () => void;
	onSent?: () => void;
}) {
	const [text, setText] = useState("");
	const { users } = useChatData();

	const inputRef = useRef<HTMLInputElement>(null);

	const canSend = permissions?.canSendMessages ?? true;
	const canSendFiles = permissions?.canSendFiles ?? true;
	const isEditing = !!editTarget;

	useEffect(() => {
		if (replyTarget) {
			inputRef.current?.focus();
		}
	}, [replyTarget]);

	useEffect(() => {
		if (editTarget) {
			setText(editTarget.body);
			inputRef.current?.focus();
		} else {
			handleCancelEdit();
		}
	}, [editTarget]);

	const handleCancelEdit = () => {
		setText("");
		onCancelEdit();
	};

	const handleSend = () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		if (editTarget) {
			if (trimmed !== editTarget.body) {
				editMessage(editTarget.id, trimmed);
			}
			setText("");
			onCancelEdit();
			return;
		}
		send(trimmed, replyTarget);
		setText("");
		onSent?.();
	};

	if (!canSend) {
		return (
			<div className="rounded-xl outline outline-(--border) flex items-center justify-center px-3 h-14 z-2 text-(--text-muted) text-sm">
				У вас нет прав для отправки сообщений в этом чате
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{editTarget ? (
				<div className="flex items-center gap-2 px-3 py-2 mb-1 ml-4 mr-2 rounded-md border border-(--border) bg-(--bg-elevated) relative before:absolute before:inset-y-0 before:-left-2 before:w-1 before:bg-(--accent) before:rounded-lg">
					<Icon
						name="edit"
						className="text-(--accent) text-lg! shrink-0"
					/>
					<div className="min-w-0 flex-1">
						<p className="text-base text-(--accent) font-bold">
							Редактирование сообщения
						</p>
						<p className="text-sm text-(--text-secondary) truncate">
							{editTarget.body}
						</p>
					</div>
					<CloseButton
						onClose={handleCancelEdit}
						title="Отменить"
						aria-label="Отменить"
					/>
				</div>
			) : (
				replyTarget && (
					<div className="flex items-center gap-2 px-3 py-2 mb-1 ml-4 mr-2 rounded-md border border-(--border) bg-(--bg-elevated) relative before:absolute before:inset-y-0 before:-left-2 before:w-1  before:bg-(--accent) before:rounded-lg">
						<div className="min-w-0 flex-1">
							<p className="text-base text-(--accent) font-bold">
								{displayNameOf(users, replyTarget.senderId)}
							</p>
							<p className="text-sm text-(--text-secondary) truncate">
								{replyTarget.contentPreview}
							</p>
						</div>
						<CloseButton
							onClose={onCancelReply}
							title="Отменить"
							aria-label="Отменить"
						/>
					</div>
				)
			)}
			<div className="rounded-xl outline outline-(--border) flex items-center gap-2 px-3 h-14 z-2">
				{canSendFiles && !isEditing && (
					<ComposerButton
						icon="attach_file"
						label="Прикрепить файлы"
						onClick={() => {}}
					/>
				)}
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleSend();
						}
						if (e.key === "Escape") {
							if (editTarget) {
								e.preventDefault();
								handleCancelEdit();
								requestAnimationFrame(() => {
									inputRef.current?.focus();
								});
							} else if (replyTarget) {
								e.preventDefault();
								onCancelReply?.();
								requestAnimationFrame(() => {
									inputRef.current?.focus();
								});
							}
						}
					}}
					placeholder={isEditing ? "Изменить сообщение" : "Сообщение"}
					className="flex-1 min-w-0 bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none py-1"
					ref={inputRef}
				/>
				{!isEditing && (
					<ComposerButton
						icon="casino"
						label="Бросок кубика"
						onClick={() => {}}
					/>
				)}
				<ComposerButton
					icon={isEditing ? "check" : "send"}
					label={isEditing ? "Сохранить" : "Отправить"}
					onClick={handleSend}
					disabled={!text.trim()}
				/>
			</div>
		</div>
	);
}

function PinStack({ count }: { count: number }) {
	return (
		<div className="relative shrink-0 w-6 h-6 flex items-center justify-center text-(--accent)">
			<Icon name="push_pin" className="text-lg!" />
			{count > 1 && (
				<span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-(--accent) text-(--bg-card) text-[10px] leading-3.5 text-center font-bold">
					{count}
				</span>
			)}
		</div>
	);
}

function PinnedBar({
	pinnedMessages,
	onJump,
	onUnpin,
	canUnpin,
}: {
	pinnedMessages: PinnedMessage[];
	chatId: string;
	messages: Record<string, ChatMessage>;
	onJump: (id: string) => void;
	onUnpin: (messageId: string) => void;
	canUnpin: boolean;
}) {
	const [index, setIndex] = useState(0);
	const [panelOpen, setPanelOpen] = useState(false);

	const chatId = useCurrentChatId();
	const ids = useMemo(
		() => pinnedMessages.map((p) => p.messageId),
		[pinnedMessages],
	);
	const resolved = useResolveMessages(chatId, ids);

	useEffect(() => {
		if (index >= pinnedMessages.length) setIndex(0);
	}, [pinnedMessages.length, index]);

	if (!pinnedMessages.length) return null;
	const currentId = (pinnedMessages[index] ?? pinnedMessages[0]).messageId;
	const currentMsg = resolved[index]?.data;

	const handleBarClick = () => {
		onJump(currentId);
		setIndex((i) => (i + 1) % pinnedMessages.length);
	};

	return (
		<div className="flex items-center gap-2 px-3 py-2 mt-1 ml-4 mr-2 border border-(--border) shrink-0 rounded-md bg-(--bg-elevated) relative before:absolute before:inset-y-0 before:-left-2 before:w-1  before:bg-(--accent) before:rounded-lg">
			<button
				type="button"
				onClick={handleBarClick}
				className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
			>
				<PinStack count={pinnedMessages.length} />
				<div className="min-w-0 flex-1">
					<p className="text-xs text-(--accent) font-bold">
						Закреплённое сообщение
						{pinnedMessages.length > 1 &&
							` ${index + 1}/${pinnedMessages.length}`}
					</p>
					<p className="text-sm text-(--text-secondary) truncate">
						{currentMsg ? currentMsg.body : "…"}
					</p>
				</div>
			</button>

			{pinnedMessages.length > 1 && (
				<button
					type="button"
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						setPanelOpen((o) => !o);
					}}
					aria-label="Все закреплённые сообщения"
					className="text-(--text-muted) flex justify-center items-center hover:text-(--text-primary) transition-colors cursor-pointer p-1 rounded-md hover:bg-(--bg-elevated) shrink-0"
				>
					<Icon name="format_list_bulleted" />
				</button>
			)}
			{pinnedMessages.length === 1 && canUnpin && (
				<CloseButton
					onClose={() => onUnpin(pinnedMessages[0].messageId)}
					aria-label="Открепить"
					title="Открепить"
				/>
			)}

			{panelOpen && (
				<PinnedListPanel
					pins={pinnedMessages}
					canUnpin={canUnpin}
					onSelect={(id) => {
						onJump(id);
						setPanelOpen(false);
					}}
					onUnpin={onUnpin}
					onClose={() => setPanelOpen(false)}
				/>
			)}
		</div>
	);
}

function PinnedListPanel({
	pins,
	canUnpin,
	onSelect,
	onUnpin,
	onClose,
}: {
	pins: PinnedMessage[];
	canUnpin: boolean;
	onSelect: (id: string) => void;
	onUnpin: (id: string) => void;
	onClose: () => void;
}) {
	const { users } = useChatData();
	const panelRef = useRef<HTMLDivElement>(null);

	const chatId = useCurrentChatId();
	const ids = useMemo(() => pins.map((p) => p.messageId), [pins]);
	const resolved = useResolveMessages(chatId, ids);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				panelRef.current &&
				!panelRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [onClose]);

	return (
		<div
			ref={panelRef}
			className="absolute top-full right-4 mt-1 w-80 max-h-96 overflow-y-auto rounded-xl border border-(--border) bg-(--bg-surface) shadow-lg z-10 flex flex-col gap-0.5 p-1"
		>
			{pins.map((p, i) => {
				const m = resolved[i]?.data;
				if (!m) {
					return (
						<div
							key={p.messageId}
							className="p-2 rounded-lg animate-pulse h-14"
						/>
					);
				}
				return (
					<div
						key={m.id}
						className="group flex items-center gap-2 p-2 rounded-lg hover:bg-(--bg-elevated)"
					>
						<button
							type="button"
							onClick={() => onSelect(m.id)}
							className="min-w-0 flex-1 text-left cursor-pointer flex items-center gap-3  rounded-xl transition-colors"
						>
							<div className="shrink-0">
								<AvatarImage
									src={users[m.senderId].avatarUrl}
									alt={users[m.senderId].username ?? "?"}
									size="md"
								/>
							</div>
							<div className="flex flex-col gap-1 w-full">
								<p className="text-base flex items-baseline gap-2 flex-wrap">
									<Link
										className="text-(--text-primary) font-bold hover:underline"
										to={
											"/users/" +
											users[m.senderId].username
										}
									>
										{displayNameOf(users, m.senderId)}
									</Link>
									<span className="text-(--text-muted) text-sm">
										{formatMessageTime(m.createdAt)}
									</span>
									{m.editedAt && (
										<span className="text-(--text-muted) text-sm">
											· изменено
										</span>
									)}
								</p>
								{m.replyTo && (
									<ReplyPreview
										replyTo={m.replyTo}
										onJump={onSelect}
										users={users}
										deleted={m.replyTo.deleted}
									/>
								)}
								<p className="text-(--text-primary) wrap-break-word text-base">
									{m.body}
								</p>
							</div>
						</button>
						{canUnpin && (
							<CloseButton
								onClose={() => onUnpin(m.id)}
								aria-label="Открепить"
								title="Открепить"
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
