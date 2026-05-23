import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import clsx from "clsx";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import {
	AccessLevel,
	roleFor,
	SessionRelation,
	type SessionRole,
} from "./access";
import useAuth from "../../hooks/useAuth";
import { useFetchSessionQuery } from "./queries";
import Loading from "../../components/ui/Loading";
import type { IPlayer, SessionResponse } from "../../types/session";
import { ApplyButton, Price } from "../../components/ui/cards/SessionCard";
import type { IUserBrief } from "../../types/userCard";
import AvatarImage from "../../components/ui/AvatarImage";
import GMBadge from "./GMBadge";
import { SessionProvider, useSessionRole } from "./SessionContext";
import type { IUser } from "../../types/user";

const HAS_CAMPAIGN = true;

type TabDef = {
	to: string;
	label: string;
	icon: string;
	minAccess: AccessLevel;
	available?: () => boolean;
};

const TABS: TabDef[] = [
	{
		to: "info",
		label: "Инфо",
		icon: "menu_book",
		minAccess: AccessLevel.View,
	},
	{
		to: "chat",
		label: "Чат",
		icon: "forum",
		minAccess: AccessLevel.Access,
	},
	{
		to: "data",
		label: "Сессия",
		icon: "file_copy",
		minAccess: AccessLevel.Access,
	},
	{
		to: "campaign",
		label: "Кампейн",
		icon: "history_2",
		minAccess: AccessLevel.View,
		available: () => HAS_CAMPAIGN,
	},
	{
		to: "notes",
		label: "Заметки",
		icon: "edit_note",
		minAccess: AccessLevel.Access,
	},
	{
		to: "edit",
		label: "Изменить",
		icon: "settings",
		minAccess: AccessLevel.Edit,
	},
	{ to: "vtt", label: "VTT", icon: "map", minAccess: AccessLevel.Access },
];

function visibleFor(role: SessionRole): TabDef[] {
	return TABS.filter(
		(t) => role.can(t.minAccess) && (t.available?.() ?? true),
	);
}

export default function SessionLayout() {
	const { user, isLoading: userLoading } = useAuth();
	const { id: sessionId } = useParams<{ id: string }>();
	const {
		data: sessionData,
		isLoading: sessionLoading,
		isError,
	} = useFetchSessionQuery(sessionId);

	if (isError) {
		return (
			<p className="text-(--error) text-center py-12">Ошибка загрузки</p>
		);
	}
	if (!sessionId || !sessionData) {
		return (
			<div className="flex justify-center py-12">
				<p className="text-(--text-muted)">Сессия не найдена</p>
			</div>
		);
	}
	if (sessionLoading || userLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loading />
			</div>
		);
	}

	const role = roleFor(user, sessionData);
	const visibleTabs = visibleFor(role);

	return (
		<SessionProvider role={role} sessionData={sessionData}>
			<main className="max-w-1600 mx-auto px-4 py-6 flex gap-4 items-start">
				<TabRail tabs={visibleTabs} />

				<section className="flex-1 min-w-0 flex flex-col gap-4">
					<SessionHeader user={user} />
					<div className="p-6 min-h-96">
						<Outlet context={[sessionData]} />
					</div>
				</section>

				<RightRail
					masterId={sessionData.session.masterId}
					players={sessionData.players}
					briefs={sessionData.users}
					authId={user?.id}
					seats={{
						max: sessionData.session.maxSeats,
						free: sessionData.session.freeSeats,
					}}
				/>
			</main>
		</SessionProvider>
	);
}

function TabRail({ tabs }: { tabs: TabDef[] }) {
	return (
		<aside className="w-24 shrink-0 flex flex-col gap-3 sticky top-[calc(var(--header-h)+1rem)]">
			{tabs.map((t) => (
				<NavLink
					key={t.to}
					to={t.to}
					className={({ isActive }) =>
						clsx(
							"flex flex-col items-center justify-center gap-1 rounded-lg border bg-(--bg-card) px-2 py-4 transition-colors",
							isActive
								? "border-(--accent) text-(--accent) relative before:absolute before:inset-y-0 before:-left-3 before:w-1 before:bg-(--accent) before:rounded-lg"
								: "border-(--border) text-(--text-secondary) hover:bg-(--bg-elevated) hover:text-(--text-primary)",
						)
					}
				>
					<Icon name={t.icon} className="text-2xl!" />
					<span className="font-body text-sm">{t.label}</span>
				</NavLink>
			))}
		</aside>
	);
}

function SessionHeader({ user }: { user: IUser | null }) {
	const { role, sessionData } = useSessionRole();
	const { session } = sessionData;
	return (
		<header className="flex items-center justify-between gap-4">
			<h1 className="font-display text-3xl text-(--text-primary) truncate">
				{sessionData.session.title}
			</h1>
			{role.is(SessionRelation.Viewer) && (
				<div className="flex items-center gap-4 shrink-0">
					<Price price={sessionData.session.price} />
					<ApplyButton
						availability={session.availability}
						disabled={session.freeSeats === 0}
						isAutenticated={!!user}
						isParticipant={role.isParticipant()}
						sessionId={session.id}
					/>
				</div>
			)}
		</header>
	);
}

function RightRail({
	masterId,
	players,
	briefs,
	authId,
	seats,
}: {
	masterId: string;
	players: IPlayer[];
	briefs: Record<string, IUserBrief>;
	authId?: string;
	seats: {
		max: number;
		free: number;
	};
}) {
	const occupied = seats.max - seats.free;

	return (
		<aside className="w-80 shrink-0 flex flex-col gap-6 sticky top-[calc(var(--header-h)+1rem)]">
			<RailSection title="Мастер">
				<ParticipantCard
					key={masterId}
					brief={briefs[masterId]}
					isViewer={masterId === authId}
					gm
				/>
			</RailSection>

			<RailSection title={`Игроки · ${occupied}/${seats.max}`}>
				<div className="flex flex-col gap-2">
					{players.map((p) => (
						<ParticipantCard
							key={p.playerId}
							player={p}
							brief={briefs[p.playerId]}
							isViewer={p.playerId === authId}
						/>
					))}
					{Array.from({ length: seats.free }).map((_, i) => (
						<div
							key={`empty-${i}`}
							className="rounded-xl border border-dashed border-(--border) p-3 h-12 flex items-center justify-center text-(--text-muted) text-sm hover:border-(--accent) hover:text-(--text-accent) transition-colors cursor-pointer"
						>
							+ Место свободно
						</div>
					))}
				</div>
			</RailSection>
		</aside>
	);
}

function ParticipantCard({
	player,
	brief,
	isViewer,
	gm = false,
}: {
	player?: IPlayer;
	brief: IUserBrief;
	isViewer: boolean;
	gm?: boolean;
}) {
	const { role } = useSessionRole();
	return (
		<div className="rounded-xl border border-(--border) bg-(--bg-card) p-3 h-16 flex items-center gap-3">
			<AvatarImage src={brief.avatarUrl} alt={brief.username} size="sm" />
			<div className="flex-1 flex flex-col gap-2 min-w-0">
				<Link
					className="text-(--text-primary) flex gap-1 items-end"
					to={`/users/${brief.username}`}
				>
					<span className="hover:underline truncate">
						{brief.displayName}
					</span>
					{gm && <GMBadge />}
				</Link>
				{player?.character && (
					<span className="text-(--text-secondary) text-sm truncate">
						{[
							player.character.name,
							player.character.class,
							player.character.level,
						]
							.filter(Boolean)
							.join(" · ")}
					</span>
				)}
			</div>
			{role.can(AccessLevel.Access) && !isViewer && (
				<Icon name="chat" className="text-(--accent)!" />
			)}
		</div>
	);
}

function RailSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h2 className="font-display text-xl text-(--text-primary) text-center">
				{title}
			</h2>
			{children}
		</div>
	);
}
