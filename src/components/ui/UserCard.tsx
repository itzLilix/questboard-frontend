import { cva } from "class-variance-authority";
import AvatarImage from "./AvatarImage";
import Rating from "./UserRating";
import TextSeparator from "./TextSeparator";
import type { IUserCard } from "../../types/userCard";
import FollowButton from "./FollowButton";
import { Link } from "react-router-dom";

export type userCardProps = {
	profileData: IUserCard;
	view: "card" | "table";
};

const userCardVariants = cva(
	"relative bg-(--bg-card) border border-(--border) rounded-2xl flex gap-3 items-center",
	{
		variants: {
			view: {
				card: `max-w-3xs h-80 flex-col p-6 text-center`,
				table: `w-full flex-row px-6 py-4`,
			},
		},
	},
);

export default function UserCard({ profileData, view }: userCardProps) {
	return (
		<div className={userCardVariants({ view })}>
			<Link
				key={profileData.id}
				to={`/users/${profileData.username}`}
				className="absolute inset-0 z-0"
			/>
			<AvatarImage
				src={profileData.avatarUrl}
				size={view === "table" ? "xl" : "lg"}
				alt={profileData.username}
			/>
			<div className="text-base text-(--text-secondary) font-body flex flex-col">
				<h3 className="font-display text-xl text-(--text-primary)">
					{profileData.displayName}
				</h3>
				<p>
					<Rating
						rating={profileData.rating}
						reviewsCount={profileData.reviewsCount}
					/>
					<TextSeparator />
					<span>{profileData.sessionsHosted} партий</span>
				</p>
			</div>
			<FollowButton
				isFollowed={profileData.isFollowed}
				isOwner={false}
				username={profileData.username}
				className={`relative z-1 ${view === "table" ? "ml-auto" : ""}`}
			/>
		</div>
	);
}
