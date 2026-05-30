import {
	Outlet,
	useLocation,
	useNavigate,
	useOutletContext,
	useParams,
} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ProfileHeader from "../../features/profile/ProfileHeader";
import { useProfileQuery } from "../../features/profile/queries";
import Loading from "../../components/ui/Loading";
import Tab from "../../components/ui/Tab";
import { options } from "../../utils/options";
import { useSessionsQuery } from "../session/queries";
import { SessionScope, SessionSortBy, StatusFilter } from "../session/api";
import { SortOrder } from "../../types/query";
import SessionCardCompact from "../../components/ui/cards/SessionCompact";
import { SessionStatus, SessionType } from "../../types/session";

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

export function ProfileSessionsList({ ...props }: ProfileSessionsListProps) {
	const [id] = useOutletContext<[string]>();
	const { data, isLoading } = useSessionsQuery({
		scope: props.scope as SessionScope,
		status: StatusFilter.Public,
		masterId: props.scope === SessionScope.Mastering ? id : undefined,
		playerId: props.scope === SessionScope.Playing ? id : undefined,
		type: SessionType.Oneshot,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Desc,
		limit: 20,
	});
	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loading />
			</div>
		);
	}
	return (
		<div className="flex flex-col w-full">
			<span className="text-(--text-secondary) text-base">
				Предстоящие
			</span>
			<span className="text-(--text-secondary) text-base">Кампании</span>
			<span className="text-(--text-secondary) text-base">Ваншоты</span>
		</div>
	);
}
