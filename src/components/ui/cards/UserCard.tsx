import { cva } from "class-variance-authority";
import AvatarImage from "../AvatarImage";
import Rating from "../UserRating";
import TextSeparator from "../TextSeparator";
import type { INextSession, IUserCard } from "../../../types/userCard";
import type { SessionFormat, SessionType } from "../../../types/session";
import FollowButton from "../FollowButton";
import { Link } from "react-router-dom";
import SystemBadgesRow from "./SystemBadgesRow";
import { formatRelativeDate, pluralPartiy } from "../../../utils/words";
import { CardLine } from "./CardLine";

export type userCardProps = {
	profileData: IUserCard;
	view: "card" | "table";
};

const userCardVariants = cva(
	"relative bg-(--bg-card) border border-(--border) rounded-2xl",
	{
		variants: {
			view: {
				card: "max-w-3xs w-full p-6 flex flex-col items-center text-center gap-3",
				table: "w-full px-6 py-4 flex flex-row items-center gap-6",
			},
		},
	},
);

const FORMAT_LABEL: Record<SessionFormat, string> = {
	online: "Онлайн",
	offline: "Оффлайн",
};

const TYPE_LABEL: Record<SessionType, string> = {
	oneshot: "Ваншот",
	campaign: "Кампейн",
};

export default function UserCard({ profileData, view }: userCardProps) {
	if (view === "table") return <TableCard profileData={profileData} />;
	return <GridCard profileData={profileData} />;
}

function TableCard({ profileData }: { profileData: IUserCard }) {
	return (
		<div className={userCardVariants({ view: "table" })}>
			<Link
				to={`/users/${profileData.username}`}
				className="absolute inset-0 z-0"
				aria-label={profileData.displayName}
			/>
			<AvatarImage
				src={profileData.avatarUrl}
				size="xl"
				alt={profileData.username}
			/>
			<div className="flex flex-col gap-1 min-w-0 flex-1 text-base text-(--text-secondary) font-body">
				<h3 className="font-display text-xl text-(--text-primary) truncate">
					{profileData.displayName}
				</h3>
				<p className="flex items-center flex-wrap gap-1">
					<Rating
						rating={profileData.rating}
						reviewsCount={profileData.reviewsCount}
					/>
					<TextSeparator />
					<span>
						{profileData.sessionsHosted}{" "}
						{pluralPartiy(profileData.sessionsHosted)}
					</span>
				</p>
				<TypeLine type={profileData.preferredType} />
				<FormatLine format={profileData.preferredFormat} />
				{profileData.systemStats &&
					profileData.systemStats.length > 0 && (
						<div className="relative z-1 mt-1">
							<SystemBadgesRow stats={profileData.systemStats} />
						</div>
					)}
			</div>

			<div className="flex items-center gap-6 ml-auto shrink-0">
				<NextSessionBlock
					nextSession={profileData.nextSession}
					layout="row"
				/>
				<FollowButton
					isFollowed={profileData.isFollowed}
					isOwner={false}
					username={profileData.username}
					className="relative z-1"
				/>
			</div>
		</div>
	);
}

function GridCard({ profileData }: { profileData: IUserCard }) {
	return (
		<div className={userCardVariants({ view: "card" })}>
			<Link
				to={`/users/${profileData.username}`}
				className="absolute inset-0 z-0"
				aria-label={profileData.displayName}
			/>
			<AvatarImage
				src={profileData.avatarUrl}
				size="xl"
				alt={profileData.username}
			/>
			<h3 className="font-display text-xl text-(--text-primary) truncate max-w-full">
				{profileData.displayName}
			</h3>
			<p className="flex items-center justify-center flex-wrap text-base text-(--text-secondary) gap-1">
				<Rating
					rating={profileData.rating}
					reviewsCount={profileData.reviewsCount}
				/>
				<TextSeparator />
				<span>
					{profileData.sessionsHosted}{" "}
					{pluralPartiy(profileData.sessionsHosted)}
				</span>
			</p>

			{profileData.systemStats && profileData.systemStats.length > 0 && (
				<div className="relative z-1 w-full flex justify-center">
					<SystemBadgesRow
						stats={profileData.systemStats}
						className="justify-center"
					/>
				</div>
			)}

			<div className="flex flex-col gap-1 text-base text-(--text-secondary)">
				<TypeLine type={profileData.preferredType} />
				<FormatLine format={profileData.preferredFormat} />
			</div>

			<NextSessionBlock
				nextSession={profileData.nextSession}
				layout="inline"
			/>

			<FollowButton
				isFollowed={profileData.isFollowed}
				isOwner={false}
				username={profileData.username}
				className="relative z-1 mt-auto w-full"
			/>
		</div>
	);
}

function TypeLine({ type }: { type?: SessionType }) {
	return <CardLine label="тип" value={type} allLabels={TYPE_LABEL} />;
}

function FormatLine({ format }: { format?: SessionFormat }) {
	return <CardLine label="формат" value={format} allLabels={FORMAT_LABEL} />;
}

function NextSessionBlock({
	nextSession,
	layout,
}: {
	nextSession?: INextSession;
	layout: "row" | "inline";
}) {
	if (!nextSession) return null;
	const date = formatRelativeDate(nextSession.scheduledAt);
	const detail = `${FORMAT_LABEL[nextSession.format]} / ${TYPE_LABEL[nextSession.type]}`;

	if (layout === "inline") {
		return (
			<p className="text-base text-(--text-secondary)">
				Следующая игра:{" "}
				<span className="text-(--text-primary)">{date}</span>
			</p>
		);
	}

	return (
		<div className="flex flex-col items-end text-base text-(--text-secondary) text-right">
			<span className="text-sm text-(--text-muted) uppercase">
				ближайшая игра:
			</span>
			<span className="text-(--text-primary)">{date}</span>
			<span className="text-sm">{detail}</span>
		</div>
	);
}
