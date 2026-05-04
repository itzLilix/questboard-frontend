import { api } from "../../api/axios";

export async function followUser(username: string) {
	await api.post(`/users/${username}/follow`);
}

export async function unfollowUser(username: string) {
	await api.delete(`/users/${username}/follow`);
}
