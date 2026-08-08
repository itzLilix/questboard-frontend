import {
	createContext,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useSearchParams } from "react-router-dom";
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
} from "../../../../types/chat";
import { useFetchChatsListQuery } from "./queries";
import useAuth from "../../../auth/AuthProvider";

// type ChatMessage = {
// 	id: string;
// 	chatId: string;
// 	senderId: string;
// 	body: string;
// 	replyToId: string | null;
// 	createdAt: string;
// 	editedAt: string | null;
// 	deletedAt: string | null;
// };

// type MockSummary = {
// 	id: string;
// 	title: string;
// };

// const CHAT_IDS = {
// 	general: "0192b000-0000-7000-8000-000000000001",
// 	dm: "0192b000-0000-7000-8000-000000000002",
// 	party: "0192b000-0000-7000-8000-000000000003",
// } as const;

// const LOREM =
// 	"Лорем Ипсум — это тип текста-заполнителя, обычно используемый в дизайне и издательском деле для заполнения пространства на странице и создания впечатления о том, как будет выглядеть конечный контент. Лорем Ипсум на русском языке происходит от латинского текста римского философа Цицерона и используется с 1960-х годов. Текст бессмысленный и не несёт никакого конкретного смысла, позволяя дизайнерам сосредоточиться на макете и визуальных элементах, не отвлекаясь на значимый контент.";

// function buildMock(
// 	selfId: string | undefined,
// 	memberIds: string[],
// 	users: Record<string, IUserBrief>,
// ): { chats: MockSummary[]; messages: ChatMessage[] } {
// 	const others = memberIds.filter((id) => id !== selfId);
// 	const peerA = others[0];
// 	const peerB = others[1];
// 	const uname = (id: string) => users[id]?.displayName ?? "user";

// 	const chats: MockSummary[] = [
// 		{
// 			id: CHAT_IDS.general,
// 			title: "Общий чат",
// 		},
// 	];
// 	const messages: ChatMessage[] = [];

// 	const generalSpeaker = peerA ?? selfId;
// 	if (generalSpeaker) {
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000001",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: LOREM,
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000002",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000003",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000004",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000005",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000006",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000007",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: "Когда партия соберётся?",
// 			replyToId: null,
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000008",
// 			chatId: CHAT_IDS.general,
// 			senderId: generalSpeaker,
// 			body: LOREM,
// 			replyToId: "0192c000-0000-7000-8000-000000000001",
// 			createdAt: "2026-03-21T12:02:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 	}

// 	if (peerA) {
// 		chats.push({
// 			id: CHAT_IDS.dm,
// 			title: uname(peerA),
// 		});
// 		messages.push({
// 			id: "0192c000-0000-7000-8000-000000000002",
// 			chatId: CHAT_IDS.dm,
// 			senderId: peerA,
// 			body: LOREM,
// 			replyToId: null,
// 			createdAt: "2026-03-21T15:30:00",
// 			editedAt: null,
// 			deletedAt: null,
// 		});
// 	}

// 	if (peerA && peerB) {
// 		chats.push({
// 			id: CHAT_IDS.party,
// 			title: `${uname(peerA)}, ${uname(peerB)}…`,
// 		});
// 		messages.push(
// 			{
// 				id: "0192c000-0000-7000-8000-000000000010",
// 				chatId: CHAT_IDS.party,
// 				senderId: peerA,
// 				body: "",
// 				replyToId: null,
// 				createdAt: "2026-03-21T14:00:00",
// 				editedAt: null,
// 				deletedAt: "2026-03-21T14:01:00",
// 			},
// 			{
// 				id: "0192c000-0000-7000-8000-000000000011",
// 				chatId: CHAT_IDS.party,
// 				senderId: peerB,
// 				body: "Этот тролль перекрывает мост.",
// 				replyToId: null,
// 				createdAt: "2026-03-21T14:05:00",
// 				editedAt: null,
// 				deletedAt: null,
// 			},
// 			{
// 				id: "0192c000-0000-7000-8000-000000000012",
// 				chatId: CHAT_IDS.party,
// 				senderId: peerA,
// 				body: "Он совсем не готов к бою.",
// 				replyToId: null,
// 				createdAt: "2026-03-21T14:08:00",
// 				editedAt: "2026-03-21T14:09:00",
// 				deletedAt: null,
// 			},
// 		);
// 		if (selfId) {
// 			messages.push({
// 				id: "0192c000-0000-7000-8000-000000000013",
// 				chatId: CHAT_IDS.party,
// 				senderId: selfId,
// 				body: "Давайте его опрокинем",
// 				replyToId: "0192c000-0000-7000-8000-000000000011",
// 				createdAt: "2026-03-21T14:12:00",
// 				editedAt: null,
// 				deletedAt: null,
// 			});
// 		}
// 	}

// 	return { chats, messages };
// }

type ChatData = {
	users: Record<string, IUserBrief>;
	currentUserId?: string;
	messagesById: Map<string, ChatMessage>;
	messagesByChat: Map<string, ChatMessage[]>;
};

const ChatDataContext = createContext<ChatData | null>(null);

function useChatData(): ChatData {
	const ctx = useContext(ChatDataContext);
	if (!ctx)
		throw new Error("useChatData must be used within ChatDataContext");
	return ctx;
}

function usernameOf(users: Record<string, IUserBrief>, id: string): string {
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

	const memberIds = useMemo(
		() => [
			sessionData.session.masterId,
			...sessionData.players.map((p) => p.playerId),
		],
		[sessionData.session.masterId, sessionData.players],
	);

	const fetchedChats = useMemo(
		() => useFetchChatsListQuery(sessionData.session.id).data ?? [],
		[sessionData.session.id],
	);

	const messages = useMemo(
		() => [] as ChatMessage[],
		[currentUserId, memberIds, users],
	);

	const messagesById = useMemo(
		() => new Map(messages.map((m) => [m.id, m])),
		[messages],
	);

	const messagesByChat = useMemo(() => {
		const map = new Map<string, ChatMessage[]>();
		for (const m of messages) {
			if (m.deletedAt) continue;
			const arr = map.get(m.chatId) ?? [];
			arr.push(m);
			map.set(m.chatId, arr);
		}
		for (const arr of map.values()) {
			arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		}
		return map;
	}, [messages]);

	const [searchParams, setSearchParams] = useSearchParams();
	const paramChatId = searchParams.get("c");
	const active =
		fetchedChats.find((c) => c.id === paramChatId) ?? fetchedChats[0];

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
		() => ({ users, currentUserId, messagesById, messagesByChat }),
		[users, currentUserId, messagesById, messagesByChat],
	);

	return (
		<ChatDataContext.Provider value={data}>
			<div className="flex gap-4 h-full min-h-0">
				<ChatList
					chats={fetchedChats}
					activeId={active?.id}
					onSelect={selectChat}
				/>
				{active && <Conversation chat={active} />}
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
			<AddButton className="self-center mt-1" onClick={() => {}} />
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
	const { users, currentUserId, messagesByChat } = useChatData();
	const last = messagesByChat.get(chat.id)?.at(-1);
	if (!last) {
		return (
			<p className="truncate text-sm text-(--text-secondary)">
				Нет сообщений
			</p>
		);
	}
	const isGroup = chat.kind === ChatKind.Group;
	const sender =
		last.senderId === currentUserId
			? "Вы"
			: isGroup
				? usernameOf(users, last.senderId)
				: null;
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
	// const members = chat.memberIds
	// 	.map((id) => users[id])
	// 	.filter((u): u is IUserBrief => Boolean(u));
	// if (members.length > 1) {
	// 	return (
	// 		<div className="w-10 h-10 shrink-0 relative">
	// 			<div className="absolute top-0 left-0">
	// 				<AvatarImage
	// 					src={members[0].avatarUrl}
	// 					alt={members[0].username}
	// 					size="sm"
	// 				/>
	// 			</div>
	// 			<div className="absolute bottom-0 right-0 ring-2 ring-(--bg-card) rounded-full">
	// 				<AvatarImage
	// 					src={members[1].avatarUrl}
	// 					alt={members[1].username}
	// 					size="sm"
	// 				/>
	// 			</div>
	// 		</div>
	// 	);
	// }
	// return (
	// 	<div className="shrink-0">
	// 		<AvatarImage
	// 			src={members[0]?.avatarUrl}
	// 			alt={members[0]?.username ?? "?"}
	// 			size="md"
	// 		/>
	// 	</div>
	// );
}

function Conversation({ chat }: { chat: ChatSummary }) {
	const { messagesByChat } = useChatData();
	const messages = messagesByChat.get(chat.id) ?? [];
	const rowRefs = useRef(new Map<string, HTMLDivElement>());
	const scrollRef = useRef<HTMLDivElement>(null);
	const [flashId, setFlashId] = useState<string | null>(null);

	// Open at the newest message; re-pin to bottom when switching chats.
	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [chat.id, messages.length]);

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
					{messages.map((m) => (
						<MessageRow
							key={m.id}
							message={m}
							flash={flashId === m.id}
							onJump={jumpToMessage}
							registerRef={(el) => {
								if (el) rowRefs.current.set(m.id, el);
								else rowRefs.current.delete(m.id);
							}}
						/>
					))}
				</div>
			</div>

			<Composer />
		</div>
	);
}

function MessageRow({
	message,
	flash,
	onJump,
	registerRef,
}: {
	message: ChatMessage;
	flash?: boolean;
	onJump?: (id: string) => void;
	registerRef?: (el: HTMLDivElement | null) => void;
}) {
	const { users, messagesById } = useChatData();
	const sender = users[message.senderId];
	const replyTarget = message.replyToId
		? messagesById.get(message.replyToId)
		: undefined;
	const repliedTo = replyTarget?.deletedAt ? undefined : replyTarget;
	return (
		<div
			ref={registerRef}
			className={clsx(
				"group relative flex gap-3 p-2 rounded-xl transition-colors",
				flash
					? "bg-(--bg-elevated) ring-2 ring-(--accent)"
					: "bg-(--bg-card) hover:bg-(--bg-elevated)",
			)}
		>
			<MessageActions />
			<div className="shrink-0">
				<AvatarImage
					src={sender?.avatarUrl}
					alt={sender?.username ?? "?"}
					size="md"
				/>
			</div>
			<div className="min-w-0 flex flex-col gap-1">
				<p className="text-base flex items-baseline gap-2 flex-wrap">
					<span className="text-(--text-primary) font-bold">
						{usernameOf(users, message.senderId)}
					</span>
					<span className="text-(--text-muted) text-sm">
						{formatMessageTime(message.createdAt)}
					</span>
					{message.editedAt && (
						<span className="text-(--text-muted)">· изменено</span>
					)}
				</p>
				{repliedTo && (
					<button
						type="button"
						onClick={() => onJump?.(repliedTo.id)}
						className="text-left text-base text-(--text-secondary) border-l-2 border-(--border) hover:border-(--accent) pl-3 truncate cursor-pointer transition-colors"
					>
						<span className="text-(--text-secondary) font-bold flex flex-col gap-1">
							{usernameOf(users, repliedTo.senderId)}
						</span>
						<span>{repliedTo.body}</span>
					</button>
				)}
				<p className="text-(--text-primary) wrap-break-word text-base">
					{message.body}
				</p>
			</div>
		</div>
	);
}

function MessageActions() {
	return (
		<div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-lg border border-(--border) bg-(--bg-surface) px-1 py-0.5 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
			<MessageAction icon="reply" label="Ответить" />
			<MessageAction icon="edit" label="Изменить" />
			<MessageAction icon="push_pin" label="Закрепить" />
			<MessageAction
				icon="delete"
				label="Удалить"
				className="hover:text-(--error)!"
			/>
			{/*<MessageAction icon="check_circle" label="Выбрать" />*/}
		</div>
	);
}

function MessageAction({
	icon,
	label,
	className,
}: {
	icon: string;
	label: string;
	className?: string;
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

function Composer() {
	const [text, setText] = useState("");
	return (
		<div className="rounded-xl outline outline-(--border) flex items-center gap-2 px-3 h-14 z-2">
			<ComposerButton
				icon="attach_file"
				label="Прикрепить файлы"
				onClick={() => {}}
			/>
			<input
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Сообщение"
				className="flex-1 min-w-0 bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none py-1"
			/>
			<ComposerButton
				icon="casino"
				label="Бросок кубика"
				onClick={() => {}}
			/>
			<ComposerButton
				icon="send"
				label="Отправить"
				onClick={() => {}}
				disabled={!text.trim()}
			/>
		</div>
	);
}
