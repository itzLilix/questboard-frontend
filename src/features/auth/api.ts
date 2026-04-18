import { api, refreshTokens } from "../../api/axios";
import type { IUser } from "../../types/user";

export async function fetchMe(): Promise<IUser> {
	const res = await refreshTokens();
	return res.data;
}
export async function login(email: string, password: string) {
	const res = await api.post<IUser>("/auth/login", { email, password });
	return res.data;
}
export async function signup(input: {
	email: string;
	username: string;
	password: string;
	displayName: string;
}) {
	const res = await api.post<IUser>("/auth/signup", input);
	return res.data;
}
export async function logout() {
	await api.post("/auth/logout");
}
