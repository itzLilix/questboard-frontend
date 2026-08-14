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
} from "../../../../types/chat";
import {
	useFetchChatsListQuery,
	useMessagesQuery,
	usePermissionsQuery,
} from "./queries";
import useAuth from "../../../auth/AuthProvider";
import { useComposerSend } from "./socket";
import EmptyState from "../../../../components/ui/EmptyState";
import CreateGroupChatModal, {
	type CreateGroupChatData,
} from "./CreateChatModal";
import CloseButton from "../../../../components/ui/CloseButton";

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

	const { data: permissions } = usePermissionsQuery(chat.id);
	const { send, retry, cancelFailed } = useComposerSend(chat.id);

	const rowRefs = useRef(new Map<string, HTMLDivElement>());
	const scrollRef = useRef<HTMLDivElement>(null);
	const [flashId, setFlashId] = useState<string | null>(null);
	const [replyTarget, setReplyTarget] = useState<ReplySnippet | undefined>(
		undefined,
	);

	const prevChatIdRef = useRef(chat.id);
	const lastMessageIdRef = useRef<string | undefined>(undefined);

	// Pin to bottom on chat switch or when a new message lands at the
	// newest end. Loading older history bumps messages.length too, but
	// shouldn't yank the scroll position back down — so this keys off the
	// newest message's id rather than the array length.
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

	const jumpToMessage = (id: string) => {
		const el = rowRefs.current.get(id);
		if (!el) return; // reply target may be outside the currently loaded page
		el.scrollIntoView({ behavior: "smooth", block: "center" });
		setFlashId(id);
		window.setTimeout(
			() => setFlashId((cur) => (cur === id ? null : cur)),
			1200,
		);
	};

	const handleReply = (message: ChatMessage) => {
		setReplyTarget({
			messageId: message.id,
			senderId: message.senderId,
			contentPreview: message.body.slice(0, 200),
		});
	};

	return (
		<div className="flex-1 min-w-0 flex flex-col bg-(--bg-card) border border-(--border) rounded-xl">
			<header className="flex items-center gap-3 px-4 outline outline-(--border) rounded-xl h-14 z-2">
				{<ChatAvatar chat={chat} />}
				<span className="text-(--text-primary) truncate">
					{getChatTitle(chat)}
				</span>
			</header>

			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-scroll p-2"
			>
				<div className="flex flex-col justify-end min-h-full gap-1">
					{messagesQuery.hasNextPage && (
						<button
							type="button"
							onClick={() => messagesQuery.fetchNextPage()}
							disabled={messagesQuery.isFetchingNextPage}
							className="self-center text-sm text-(--text-secondary) hover:text-(--text-primary) py-2 disabled:opacity-50 cursor-pointer"
						>
							{messagesQuery.isFetchingNextPage
								? "Загрузка..."
								: "Загрузить более ранние"}
						</button>
					)}
					{sortedMessages.map((m) => (
						<MessageRow
							key={m.id}
							message={m}
							flash={flashId === m.id}
							permissions={permissions}
							onJump={jumpToMessage}
							onReply={handleReply}
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
				replyTarget={replyTarget}
				onCancelReply={() => setReplyTarget(undefined)}
				onSent={() => setReplyTarget(undefined)}
			/>
		</div>
	);
}

function MessageRow({
	message,
	permissions,
	flash,
	onJump,
	onReply,
	onRetry,
	onCancel,
	registerRef,
}: {
	message: ChatMessage;
	permissions?: ChatPermissions;
	flash?: boolean;
	onJump: (id: string) => void;
	onReply: (message: ChatMessage) => void;
	onRetry?: (message: ChatMessage) => void;
	onCancel?: (messageId: string) => void;
	registerRef?: (el: HTMLDivElement | null) => void;
}) {
	const { users, currentUserId } = useChatData();
	const sender = users[message.senderId];
	const repliedTo = message.replyTo?.deleted ? undefined : message.replyTo;

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
				canReply={canReply}
				canEdit={canEdit}
				canPin={canPin}
				canDelete={canDelete}
				onReply={() => onReply(message)}
				onRetry={() => onRetry?.(message)}
				onCancel={() => onCancel?.(message.id)}
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
						<span className="text-(--text-muted)">· изменено</span>
					)}
					{message.failed && (
						<span className="text-(--error) text-sm">
							· не доставлено
						</span>
					)}
				</p>
				{repliedTo && (
					<button
						type="button"
						onClick={() => onJump?.(repliedTo.messageId)}
						className="text-left text-base text-(--text-secondary) w-full border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors hover:text-(--accent)"
					>
						<span className="font-bold flex flex-col gap-1">
							{displayNameOf(users, repliedTo.senderId)}
						</span>
						<span className="text-(--text-secondary)">
							{repliedTo.contentPreview}
						</span>
					</button>
				)}
				<p className="text-(--text-primary) wrap-break-word text-base">
					{message.body}
				</p>
			</div>
		</div>
	);
}

function MessageActions({
	failed,
	pending,
	canReply,
	canEdit,
	canPin,
	canDelete,
	onReply,
	onRetry,
	onCancel,
}: {
	failed: boolean;
	pending: boolean;
	canReply?: boolean;
	canEdit?: boolean;
	canPin?: boolean;
	canDelete?: boolean;
	onReply: () => void;
	onRetry: () => void;
	onCancel: () => void;
}) {
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
					{canEdit && <MessageAction icon="edit" label="Изменить" />}
					{canPin && (
						<MessageAction icon="push_pin" label="Закрепить" />
					)}
					{canDelete && (
						<MessageAction
							icon="delete"
							label="Удалить"
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
	permissions,
	replyTarget,
	onCancelReply,
	onSent,
}: {
	send: (body: string, replyTo?: ReplySnippet | undefined) => void;
	permissions?: ChatPermissions;
	replyTarget?: ReplySnippet;
	onCancelReply: () => void;
	onSent?: () => void;
}) {
	const [text, setText] = useState("");
	const { users } = useChatData();

	const inputRef = useRef<HTMLInputElement>(null);

	const canSend = permissions?.canSendMessages ?? true;
	const canSendFiles = permissions?.canSendFiles ?? true;

	useEffect(() => {
		if (replyTarget) {
			inputRef.current?.focus();
		}
	}, [replyTarget]);

	const handleSend = () => {
		const trimmed = text.trim();
		if (!trimmed) return;
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
			{replyTarget && (
				<div className="flex items-center gap-2 px-3 py-2 mb-1 ml-4 mr-2 rounded-md bg-(--bg-elevated) relative before:absolute before:inset-y-0 before:-left-2 before:w-1  before:bg-(--accent) before:rounded-lg">
					<div className="min-w-0 flex-1">
						<p className="text-base text-(--accent) font-bold">
							{displayNameOf(users, replyTarget.senderId)}
						</p>
						<p className="text-sm text-(--text-secondary) truncate">
							{replyTarget.contentPreview}
						</p>
					</div>
					<CloseButton onClose={onCancelReply} />
				</div>
			)}
			<div className="rounded-xl outline outline-(--border) flex items-center gap-2 px-3 h-14 z-2">
				{canSendFiles && (
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
						if (e.key === "Escape" && replyTarget) {
							e.preventDefault();
							onCancelReply?.();
							requestAnimationFrame(() => {
								inputRef.current?.focus();
							});
						}
					}}
					placeholder="Сообщение"
					className="flex-1 min-w-0 bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none py-1"
					ref={inputRef}
				/>
				<ComposerButton
					icon="casino"
					label="Бросок кубика"
					onClick={() => {}}
				/>
				<ComposerButton
					icon="send"
					label="Отправить"
					onClick={handleSend}
					disabled={!text.trim()}
				/>
			</div>
		</div>
	);
}
