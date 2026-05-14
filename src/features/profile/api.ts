import { profileApi } from "../../api/axios";

export async function getUserProfile(username: string) {
	const res = await profileApi.get(`/users/${username}`);
	return res.data;
}
