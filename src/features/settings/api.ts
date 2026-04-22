import { api } from "../../api/axios";
import type { IUser } from "../../types/user";
import type { UpdateProfileInput } from "./queries";

export async function updateProfile(
	input: Partial<UpdateProfileInput>,
): Promise<IUser> {
	const res = await api.patch("/users/me", input);
	return res.data;
}

export async function uploadAvatar(file: File): Promise<IUser> {
	const form = new FormData();
	form.append("avatar", file);
	const res = await api.put("/users/me/avatar", form);
	return res.data;
}

export async function deleteAvatar(): Promise<IUser> {
	const res = await api.delete("/users/me/avatar");
	return res.data;
}

export async function uploadBanner(file: File): Promise<IUser> {
	const form = new FormData();
	form.append("banner", file);
	const res = await api.put("/users/me/banner", form);
	return res.data;
}

export async function deleteBanner(): Promise<IUser> {
	const res = await api.delete("/users/me/banner");
	return res.data;
}
