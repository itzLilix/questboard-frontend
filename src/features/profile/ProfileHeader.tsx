import BannerImage from "./BannerImage";
import { type IProfile } from "../../types/profile";
import AvatarImage from "../../components/ui/AvatarImage";
import TextField from "../../components/ui/TextField";
import { Link } from "react-router-dom";
import FollowButton from "../../components/ui/FollowButton";
import genericIcon from "../../assets/socials/generic.png";
import { getPlatform } from "../socials/platforms";
import Rating from "../../components/ui/UserRating";
import TextSeparator from "../../components/ui/TextSeparator";

type ProfileHeaderProps = {
	profile: IProfile | null;
	isOwner: boolean;
};

export default function ProfileHeader({
	profile,
	isOwner,
}: ProfileHeaderProps) {
	if (!profile) return null;
	return (
		<>
			<BannerImage src={profile.bannerUrl} size="full" />
			<ProfileInfo profile={profile} isOwner={isOwner} />
		</>
	);
}

type ProfileInfoProps = {
	profile: IProfile;
	isOwner: boolean;
};

export function ProfileInfo({ profile, isOwner }: ProfileInfoProps) {
	const isFollowed = profile.isFollowed;

	return (
		<div className="w-full flex flex-col items-start gap-4 p-6">
			<div className="w-full gap-3 flex items-center">
				<AvatarImage
					src={profile.avatarUrl}
					alt={profile.username}
					size="xl"
				/>
				<div className="flex flex-col items-start gap-2 flex-1">
					<h1 className="text-(--text-primary) text-3xl font-display flex items-center gap-1">
						<span>{profile.displayName}</span>
						{profile.links?.map((link) => {
							const platform = getPlatform(link.type);
							return (
								<Link
									key={link.url}
									to={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="shrink-0"
								>
									<img
										src={platform?.iconUrl ?? genericIcon}
										title={platform?.label ?? link.url}
										alt={platform?.label ?? ""}
										className="w-6 h-6 cursor-pointer"
									/>
								</Link>
							);
						})}
					</h1>
					<p className="text-base text-(--text-secondary) font-body">
						@{profile.username}
					</p>
					<p className="text-base text-(--text-secondary) font-body flex items-center gap-1">
						<span>{profile.sessionsPlayed} сыграно</span>
						<TextSeparator />
						<span>{profile.sessionsHosted} проведено</span>
						<TextSeparator />
						<Rating
							rating={profile.rating}
							reviewsCount={profile.reviewsCount}
						/>
					</p>
				</div>
				<FollowButton
					username={profile.username}
					isOwner={isOwner}
					isFollowed={isFollowed}
				/>
			</div>
			<TextField title="О себе" isShrinkable={true}>
				{
					<p className="text-base font-body text-(--text-primary)">
						{profile.bio ||
							"Пользователь не указал информацию о себе."}
					</p>
				}
			</TextField>
		</div>
	);
}
