import useAuth from "../hooks/useAuth";
import ProfileHeader from "../components/layout/ProfileHeader";
import type { IUser } from "../types/types";

export default function ProfilePage({ profile }: { profile: IUser | null }) {
	const { user } = useAuth();
	const isOwner = user?.id === profile?.id;

	return (
		<main className="max-w-960 mx-auto p-4">
			<ProfileHeader profile={profile} isOwner={isOwner} />
		</main>
	);
}
