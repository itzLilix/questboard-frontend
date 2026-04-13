import type { IUser } from "../../types/types";

export default function Banner({ user }: { user: IUser | null }) {
	if (!user) return null;

	return (
		<div
			className={`w-full h-44 bg-[url('${user.bannerUrl}')] bg-center bg-cover rounded-2xl`}
		></div>
	);
}
