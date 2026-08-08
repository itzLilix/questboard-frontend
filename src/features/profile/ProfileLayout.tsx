import { useMemo } from "react";
import {
	Outlet,
	useLocation,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";
import { useUrlSearch } from "../../hooks/useUrlState";
import Input from "../../components/ui/inputs/Input";
import ProfileHeader from "../../features/profile/ProfileHeader";
import { useProfileQuery } from "../../features/profile/queries";
import Loading from "../../components/ui/Loading";
import Tab from "../../components/ui/Tab";
import { options } from "../../utils/options";
import {
	collectCampaigns,
	useCampaignsQuery,
	useSessionsQuery,
} from "../session/queries";
import { SessionScope, SessionSortBy, StatusFilter } from "../session/api";
import { SortOrder } from "../../types/query";
import CampaignAccordion from "../../components/ui/cards/CampaignAccordion";
import CollapsibleSection from "../../components/ui/CollapsibleSection";
import { SessionType } from "../../types/session";
import ListLoading from "../../components/ui/ListLoading";
import EmptyState from "../../components/ui/EmptyState";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { SessionList } from "../session/sessionList";
import useAuth from "../auth/AuthProvider";

const TAB_OPTIONS = options([
	{ value: "hosted", label: "Партии мастера" },
	{ value: "played", label: "Партии игрока" },
	{ value: "reviews", label: "Отзывы" },
]);

export default function ProfileLayout() {
	const { username } = useParams<{ username: string }>();
	const { user } = useAuth();
	const { data: profile, isLoading } = useProfileQuery(username);

	const navigate = useNavigate();
	const { pathname } = useLocation();
	const active = pathname.split("/").at(-1);

	if (isLoading)
		return (
			<Loading className="absolute top-1/2 left-1/2 transform -translate-1/2 -translate-y-1/2" />
		);

	const isOwner = user?.id === profile?.id && profile !== null;

	return (
		<main className="flex-1  max-w-960 w-full mx-auto p-4 flex flex-col gap-6">
			<ProfileHeader profile={profile} isOwner={isOwner} />
			<nav className="font-display text-2xl flex gap-4">
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
			<Outlet context={[profile.id]} />
		</main>
	);
}

type ProfileSessionsListProps = {
	scope: Omit<SessionScope, "catalog">;
};

export function ProfileSessionsList({ scope }: ProfileSessionsListProps) {
	const [id] = useOutletContext<[string]>();
	const { input, setInput, value: search } = useUrlSearch("search");
	return (
		<div className="flex flex-col gap-4 w-full">
			<Input
				placeholder="Поиск партий"
				value={input}
				onChange={(e) => setInput(e.target.value)}
			/>
			{scope === SessionScope.Mastering ? (
				<MasterSessionsList masterId={id} search={search} />
			) : (
				<PlayerSessionsList playerId={id} search={search} />
			)}
		</div>
	);
}

function MasterSessionsList({
	masterId,
	search,
}: {
	masterId: string;
	search: string;
}) {
	const now = useMemo(() => new Date().toISOString(), []);
	const campaignsQuery = useCampaignsQuery({
		masterId,
		search: search || undefined,
	});
	const upcomingQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		masterId,
		status: StatusFilter.Public,
		search: search || undefined,
		dateFrom: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Asc,
		limit: 20,
	});
	const oneshotsQuery = useSessionsQuery({
		scope: SessionScope.Mastering,
		masterId,
		status: StatusFilter.Public,
		search: search || undefined,
		type: search ? undefined : SessionType.Oneshot,
		dateTo: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Desc,
		limit: 20,
	});
	const upcomingSentinel = useInfiniteScroll(upcomingQuery);
	const campaignsSentinel = useInfiniteScroll(campaignsQuery);
	const oneshotsSentinel = useInfiniteScroll(oneshotsQuery);

	if (
		campaignsQuery.isLoading ||
		upcomingQuery.isLoading ||
		oneshotsQuery.isLoading
	) {
		return <ListLoading />;
	}

	const campaigns = campaignsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const upcoming = upcomingQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const oneshots = oneshotsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const upcomingCampaigns = collectCampaigns(upcomingQuery.data?.pages);
	const searchCampaigns = collectCampaigns(oneshotsQuery.data?.pages);

	if (
		campaigns.length === 0 &&
		upcoming.length === 0 &&
		oneshots.length === 0
	) {
		return (
			<EmptyState
				text={search ? "Ничего не найдено" : "Партий пока нет"}
			/>
		);
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
				title="Партии"
				sessions={oneshots}
				sentinelRef={oneshotsSentinel}
				isFetchingNextPage={oneshotsQuery.isFetchingNextPage}
				campaigns={searchCampaigns}
			/>
		</div>
	);
}

function PlayerSessionsList({
	playerId,
	search,
}: {
	playerId: string;
	search: string;
}) {
	const now = useMemo(() => new Date().toISOString(), []);
	const upcomingQuery = useSessionsQuery({
		scope: SessionScope.Playing,
		playerId,
		status: StatusFilter.Public,
		search: search || undefined,
		dateFrom: now,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Asc,
		limit: 20,
	});
	const pastQuery = useSessionsQuery({
		scope: SessionScope.Playing,
		playerId,
		status: StatusFilter.Public,
		search: search || undefined,
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
		return (
			<EmptyState
				text={search ? "Ничего не найдено" : "Партий пока нет"}
			/>
		);
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
