import { cva } from "class-variance-authority";
import AvatarImage from "./AvatarImage";
import Rating from "./UserRating";
import TextSeparator from "./TextSeparator";
import type { IUserCard } from "../../types/userCard";

type userCardProps = {
	profileData: IUserCard;
	view: "card" | "table";
};

const userCardVariants = cva(
	"bg-(--bg-card) border border-(--border) rounded-2xl flex gap-3 items-center",
	{
		variants: {
			view: {
				card: `max-w-3xs h-80 flex-col p-6`,
				table: `w-full flex-row px-3 py-4`,
			},
		},
	},
);

export default function UserCard({ profileData, view }: userCardProps) {
	return (
		<div className={userCardVariants({ view })}>
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
		</div>
	);
}
