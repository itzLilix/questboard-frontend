import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ProfileHeader from "../../features/profile/ProfileHeader";
import { useProfileQuery } from "../../features/profile/queries";
import Loading from "../ui/Loading";

export default function ProfileLayout() {
	const { username } = useParams<{ username: string }>();
	const { user } = useAuth();
	const { data: profile, isLoading } = useProfileQuery(username);

	if (isLoading)
		return (
			<Loading className="absolute top-1/2 left-1/2 transform -translate-1/2 -translate-y-1/2" />
		);

	const isOwner = user?.id === profile?.id && profile !== null;

	return (
		<main className="flex-1  max-w-960 w-full mx-auto p-4">
			<ProfileHeader profile={profile} isOwner={isOwner} />
		</main>
	);
}
