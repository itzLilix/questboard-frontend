import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Tab from "../../components/ui/Tab";
import { options, type Option } from "../../utils/options";
import useAuth from "../../hooks/useAuth";
import {
	collectCampaigns,
	useCampaignsQuery,
	useSessionsQuery,
} from "./queries";
import { SessionScope, SessionSortBy, StatusFilter } from "./api";
import { SortOrder } from "../../types/query";
import { SessionType } from "../../types/session";
import SessionCardCompact from "../../components/ui/cards/SessionCompact";
import CampaignAccordion from "../../components/ui/cards/CampaignAccordion";
import CollapsibleSection from "../../components/ui/CollapsibleSection";
import ListLoading from "../../components/ui/ListLoading";
import EmptyState from "../../components/ui/EmptyState";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { SessionList } from "./sessionList";

const TAB_OPTIONS = options([
	{ value: "mastering", label: "Мастер" },
	{ value: "playing", label: "Игрок" },
	{ value: "drafts", label: "Черновики" },
	{ value: "cancelled", label: "Отмененные" },
]) satisfies readonly Option<string>[];

export default function MySessionsLayout() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const active = pathname.split("/").at(-1);

	return (
		<div className="w-960 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Мои сессии
			</h1>
			<main>
				<nav className="mx-auto font-display text-2xl flex gap-4 mb-6">
					{TAB_OPTIONS.map((o) => (
						<Tab
							key={o.value}
							onClick={() => navigate(o.value)}
							isActive={active === o.value}
						>
							{o.label}
						</Tab>
					))}
				</nav>
				<Outlet />
			</main>
		</div>
	);
}

export function MasteringTab() {
	const { user } = useAuth();
	const now = useMemo(() => new Date().toISOString(), []);

	const campaignsQuery = useCampaignsQuery(
		{ masterId: user?.id },
		{ enabled: !!user?.id },
	);
	const upcomingQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		status: StatusFilter.Public,
		dateFrom: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Asc,
		limit: 20,
	});
	const pastQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		type: SessionType.Oneshot,
		status: StatusFilter.Public,
		dateTo: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Desc,
		limit: 20,
	});

	const upcomingSentinel = useInfiniteScroll(upcomingQuery);
	const campaignsSentinel = useInfiniteScroll(campaignsQuery);
	const pastSentinel = useInfiniteScroll(pastQuery);

	if (
		campaignsQuery.isLoading ||
		upcomingQuery.isLoading ||
		pastQuery.isLoading
	) {
		return <ListLoading />;
	}

	const campaigns = campaignsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const upcoming = upcomingQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const past = pastQuery.data?.pages.flatMap((p) => p.items) ?? [];

	if (campaigns.length === 0 && upcoming.length === 0 && past.length === 0) {
		return <EmptyState text="Партий пока нет" />;
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<SessionList
				title="Предстоящие"
				isUpcoming
				sessions={upcoming}
				sentinelRef={upcomingSentinel}
				isFetchingNextPage={upcomingQuery.isFetchingNextPage}
			/>
			{campaigns.length > 0 && (
				<CollapsibleSection title="Кампании">
					{campaigns.map((campaign) => (
						<CampaignAccordion
							key={campaign.id}
							campaign={campaign}
						/>
					))}
					<div ref={campaignsSentinel} className="h-1" />
					{campaignsQuery.isFetchingNextPage && <ListLoading />}
				</CollapsibleSection>
			)}
			<SessionList
				title="Прошедшие"
				sessions={past}
				sentinelRef={pastSentinel}
				isFetchingNextPage={pastQuery.isFetchingNextPage}
			/>
		</div>
	);
}

export function PlayingTab() {
	const now = useMemo(() => new Date().toISOString(), []);

	const upcomingQuery = useSessionsQuery({
		scope: SessionScope.Playing,
		status: StatusFilter.Public,
		dateFrom: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Asc,
		limit: 20,
	});
	const pastQuery = useSessionsQuery({
		scope: SessionScope.Playing,
		status: StatusFilter.Public,
		dateTo: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Desc,
		limit: 20,
	});

	const upcomingSentinel = useInfiniteScroll(upcomingQuery);
	const pastSentinel = useInfiniteScroll(pastQuery);

	if (upcomingQuery.isLoading || pastQuery.isLoading) return <ListLoading />;

	const upcoming = upcomingQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const past = pastQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const upcomingCampaigns = collectCampaigns(upcomingQuery.data?.pages);
	const pastCampaigns = collectCampaigns(pastQuery.data?.pages);

	if (upcoming.length === 0 && past.length === 0) {
		return <EmptyState text="Партий пока нет" />;
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<SessionList
				title="Предстоящие"
				isUpcoming
				sessions={upcoming}
				sentinelRef={upcomingSentinel}
				isFetchingNextPage={upcomingQuery.isFetchingNextPage}
				campaigns={upcomingCampaigns}
			/>
			<SessionList
				title="Прошедшие"
				sessions={past}
				sentinelRef={pastSentinel}
				isFetchingNextPage={pastQuery.isFetchingNextPage}
				campaigns={pastCampaigns}
			/>
		</div>
	);
}

export function DraftsTab() {
	const sessionsQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		status: StatusFilter.Draft,
		sort: SessionSortBy.CreatedAt,
		order: SortOrder.Desc,
		limit: 20,
	});
	const sentinel = useInfiniteScroll(sessionsQuery);

	if (sessionsQuery.isLoading) return <ListLoading />;

	const sessions = sessionsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const campaigns = collectCampaigns(sessionsQuery.data?.pages);

	if (sessions.length === 0) {
		return <EmptyState text="Черновиков пока нет" />;
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			{sessions.map((session) => (
				<SessionCardCompact
					key={session.id}
					sessionData={session}
					campaignRef={campaigns[session.id]}
				/>
			))}
			<div ref={sentinel} className="h-1" />
			{sessionsQuery.isFetchingNextPage && <ListLoading />}
		</div>
	);
}

export function CancelledTab() {
	const sessionsQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		status: StatusFilter.Cancelled,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Desc,
		limit: 20,
	});
	const sentinel = useInfiniteScroll(sessionsQuery);

	if (sessionsQuery.isLoading) return <ListLoading />;

	const sessions = sessionsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const campaigns = collectCampaigns(sessionsQuery.data?.pages);

	if (sessions.length === 0) {
		return <EmptyState text="Отмененных сессий нет" />;
	}

	return (
		<div className="flex flex-col gap-2 w-full">
			{sessions.map((session) => (
				<SessionCardCompact
					key={session.id}
					sessionData={session}
					campaignRef={campaigns[session.id]}
				/>
			))}
			<div ref={sentinel} className="h-1" />
			{sessionsQuery.isFetchingNextPage && <ListLoading />}
		</div>
	);
}
