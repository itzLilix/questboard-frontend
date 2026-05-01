import { api } from "../../api/axios";
import type { SessionFormat, SessionType } from "../../types/session";
import type { ProfileCardData } from "../../types/userCard";

export type UsersQuery = {
	search?: string;
	format?: SessionFormat;
	type?: SessionType;
	city?: string;
	minRating?: number;
	followedBy?: string;
	onlyGMs?: boolean;
	sort?: SortBy;
	order?: "asc" | "desc";
	cursor?: string;
	limit?: number;
};

export type SortBy =
	| "rating"
	| "recent"
	| "followedAt"
	| "reviews"
	| "sessions";

export type UsersListResponse = {
	items: ProfileCardData[];
	nextCursor: string | null;
};

export async function getFollowingList(
	params: UsersQuery,
): Promise<UsersListResponse> {
	const res = await api.get<UsersListResponse>("/users/", { params });
	return res.data;
}
