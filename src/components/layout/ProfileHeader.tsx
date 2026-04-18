import BannerImage from "../ui/BannerImage";
import { type IProfile } from "../../types/types";
import AvatarImage from "../ui/AvatarImage";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import TextField from "../ui/TextField";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import useAuthModal from "../../hooks/useAuthModal";
import { useEffect, useState } from "react";

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
	profile: IProfile | null;
	isOwner: boolean;
};

export function ProfileInfo({ profile, isOwner }: ProfileInfoProps) {
	if (!profile) return null;

	const { openAuthModal } = useAuthModal();
	const [isFollowed, setIsFollowed] = useState(profile.isFollowed);
	const navigate = useNavigate();

	useEffect(() => {
		setIsFollowed(profile.isFollowed);
	}, [profile.isFollowed]);

	const handleFollow = async () => {
		await api
			.post(`/users/${profile.username}/follow`)
			.then(() => {
				profile.isFollowed = true;
				setIsFollowed(true);
			})
			.catch((err) => {
				if (err.response?.status === 401) {
					openAuthModal("login");
				}
			});
	};

	const handleUnfollow = async () => {
		await api
			.delete(`/users/${profile.username}/follow`)
			.then(() => {
				profile.isFollowed = false;
				setIsFollowed(false);
			})
			.catch((err) => {
				if (err.response?.status === 401) {
					openAuthModal("login");
				}
			});
	};

	return (
		<div className="w-full flex flex-col items-start gap-4 p-6">
			<div className="w-full gap-3 flex items-center">
				<AvatarImage
					src={profile.avatarUrl}
					alt={profile.username}
					size="xl"
				/>
				<div className="flex flex-col items-start gap-2 flex-1">
					<h1 className="text-(--text-primary) text-3xl font-display">
						<span>{profile.displayName}</span>
						{profile.links?.map((link) => (
							<Link
								key={link.url}
								to={link.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={link.icon} alt="" />
							</Link>
						))}
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
						onClick={() => handleUnfollow()}
					>
						Отписаться
					</Button>
				) : (
					<Button
						variant="primary"
						csize="sm"
						onClick={() => handleFollow()}
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
