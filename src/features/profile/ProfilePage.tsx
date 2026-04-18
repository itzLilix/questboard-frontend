import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProfileHeader from "../components/layout/ProfileHeader";
import { api } from "../api/axios";
import type { IProfile } from "../types/types";

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user } = useAuth();
	const [profile, setProfile] = useState<IProfile | null>(null);

	useEffect(() => {
		if (!username) return;
		api.get<IProfile>(`/users/${username}`)
			.then((res) => setProfile(res.data))
			.catch(() => setProfile(null));
	}, [username]);

	const isOwner = user?.id === profile?.id && profile !== null;

	return (
		<main className="max-w-960 mx-auto p-4">
			<ProfileHeader profile={profile} isOwner={isOwner} />
		</main>
	);
}
