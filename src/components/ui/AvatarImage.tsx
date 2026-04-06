import type { IUser } from "../../types/types";

export default function AvatarImage({
	user,
	size = "sm",
}: {
	user: IUser;
	size: "sm" | "md" | "lg";
}) {
	const sizeClasses = {
		sm: "w-6 h-6 text-sm",
		md: "w-10 h-10 text-xl",
		lg: "w-16 h-16 text-3xl",
		xl: "w-24 h-24 text-4xl",
	};

	return (
		<>
			{user.avatarUrl ? (
				<img
					src={user.avatarUrl}
					alt={user.username}
					className={`${sizeClasses[size]} rounded-full`}
				/>
			) : (
				<div
					className={`${sizeClasses[size]} rounded-full bg-(--accent) flex items-center justify-center`}
				>
					{user.username[0].toUpperCase()}
				</div>
			)}
		</>
	);
}
