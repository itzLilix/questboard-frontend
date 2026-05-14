import { profileApi } from "../../api/axios";

export async function followUser(username: string) {
	await profileApi.post(`/users/${username}/follow`);
}

export async function unfollowUser(username: string) {
	await profileApi.delete(`/users/${username}/follow`);
}
