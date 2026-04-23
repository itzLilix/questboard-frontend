import BannerImage from "./BannerImage";
import { type IProfile } from "../../types/profile";
import AvatarImage from "../../components/ui/AvatarImage";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import TextField from "../../components/ui/TextField";
import { Link, useNavigate } from "react-router-dom";
import { useFollowMutation, useUnfollowMutation } from "./queries";
import { useAuthModal } from "../auth/authModalStore";
import type { AxiosError } from "axios";
import genericIcon from "../../assets/socials/generic.png";
import { getPlatform } from "../socials/platforms";

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
	const openAuthModal = useAuthModal((s) => s.open);
	const navigate = useNavigate();

	const follow = useFollowMutation(profile.username);
	const unfollow = useUnfollowMutation(profile.username);

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
					<h1 className="text-(--text-primary) text-3xl font-display flex gap-1">
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
										className="w-8 h-8 cursor-pointer"
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
						<span className="text-(--text-muted)">/</span>
						<span>{profile.sessionsHosted} проведено</span>
						<span className="text-(--text-muted)">/</span>
						{profile.rating === 0 ? (
							<span>Нет рейтинга</span>
						) : (
							<span className="flex items-center gap-1">
								<Icon
									name="star"
									className="text-base! text-(--accent)!"
								/>
								{profile.rating.toFixed(1)} (
								{profile.reviewsCount})
							</span>
						)}
					</p>
				</div>
				{isOwner ? (
					<Button
						variant="secondary"
						csize="sm"
						onClick={() => {
							navigate("/settings/profile");
						}}
					>
						Редактировать
					</Button>
				) : isFollowed ? (
					<Button
						variant="secondary"
						csize="sm"
						onClick={() => unfollow.mutate()}
					>
						Отписаться
					</Button>
				) : (
					<Button
						variant="primary"
						csize="sm"
						onClick={() =>
							follow.mutate(undefined, {
								onError: (e) =>
									(e as AxiosError).status === 401 &&
									openAuthModal("login"),
							})
						}
					>
						Отслеживать
					</Button>
				)}
			</div>
			{
				<TextField title="О себе" isShrinkable={true}>
					{
						<p className="text-base font-body text-(--text-primary)">
							{profile.bio ||
								"Пользователь не указал информацию о себе."}
						</p>
					}
				</TextField>
			}
		</div>
	);
}
