import Button from "./Button";
import { useNavigate } from "react-router-dom";
import {
	useFollowMutation,
	useUnfollowMutation,
} from "../../features/following/queries";
import { useAuthModal } from "../../features/auth/authModalStore";
import type { AxiosError } from "axios";

type FollowButtonProps = {
	username: string;
	isOwner: boolean;
	isFollowed: boolean | undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function FollowButton({
	username,
	isOwner,
	isFollowed,
	className,
	disabled,
}: FollowButtonProps) {
	const openAuthModal = useAuthModal((s) => s.open);
	const navigate = useNavigate();

	const follow = useFollowMutation(username);
	const unfollow = useUnfollowMutation(username);

	if (isOwner) {
		return (
			<Button
				variant="secondary"
				csize="sm"
				onClick={() => {
					navigate("/settings/profile");
				}}
				disabled={disabled}
				className={className}
			>
				Редактировать
			</Button>
		);
	}

	if (isFollowed) {
		return (
			<Button
				variant="secondary"
				csize="sm"
				onClick={() => unfollow.mutate()}
				disabled={disabled}
				className={className}
			>
				Отписаться
			</Button>
		);
	}

	return (
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
			disabled={disabled}
			className={className}
		>
			Отслеживать
		</Button>
	);
}
