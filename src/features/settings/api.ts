import { api } from "../../api/axios";

export async function updateProfile(input: FormData) {
	const res = await api.patch(`/me`, input);
	return res.data;
}
