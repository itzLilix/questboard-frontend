import { useParams } from "react-router-dom";
import useAuth from "../../features/auth/useAuth";
import ProfileHeader from "../../features/profile/ProfileHeader";
import { useProfileQuery } from "../../features/profile/queries";
import Loading from "../ui/Loading";

export default function ProfileLayout() {
	const { username } = useParams<{ username: string }>();
	const { user } = useAuth();
	const { data: profile, isLoading } = useProfileQuery(username);

	if (isLoading) return <Loading />;

	const isOwner = user?.id === profile?.id && profile !== null;

	return (
		<main className="flex-1 overflow-y-auto max-w-960 w-full mx-auto p-4">
			<ProfileHeader profile={profile} isOwner={isOwner} />
		</main>
	);
}
