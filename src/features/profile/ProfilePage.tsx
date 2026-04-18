import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../auth/useAuth";
import ProfileHeader from "./ProfileHeader";
import { api } from "../../api/axios";
import type { IProfile } from "../../types/profile";
import { useProfileQuery } from "./queries";

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const { user } = useAuth();
	const { data: profile, isLoading } = useProfileQuery(username);

	const isOwner = user?.id === profile?.id && profile !== null;

	return (
		<main className="max-w-960 mx-auto p-4">
			<ProfileHeader profile={profile} isOwner={isOwner} />
		</main>
	);
}
