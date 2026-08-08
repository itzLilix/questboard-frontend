import { profileApi } from "../../api/axios";
import type { IUser } from "../../types/user";

export async function fetchMe(): Promise<IUser> {
	console.trace("fetchMe called");
	// Plain read — if the access token is expired, the 401 interceptor
	// refreshes once and retries, so tokens only rotate when needed.
	const res = await profileApi.get<IUser>("/users/me");
	return res.data;
}
export async function login(email: string, password: string) {
	const res = await profileApi.post<IUser>("/auth/login", {
		email,
		password,
	});
	return res.data;
}
export async function signup(input: {
	email: string;
	username: string;
	password: string;
	displayName: string;
}) {
	const res = await profileApi.post<IUser>("/auth/signup", input);
	return res.data;
}
export async function logout() {
	await profileApi.post("/auth/logout");
}
