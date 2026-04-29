import { api } from "../../api/axios";
import type { ProfileCardData } from "../../types/userCard";

export async function getFollowingList(): Promise<ProfileCardData> {
	const res = await api.get<ProfileCardData>("/users/");
	return res.data;
}
