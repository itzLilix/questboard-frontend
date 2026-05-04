import { api } from "../../api/axios";

export async function getUserProfile(username: string) {
	const res = await api.get(`/users/${username}`);
	return res.data;
}
