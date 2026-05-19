import { profileApi } from "../../api/axios";
import type { SessionFormat, SessionType } from "../../types/session";
import type { IUserCard, ProfileCardData } from "../../types/userCard";
import { fetchSessionCards } from "../session/api";

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

export type SortOrder = "asc" | "desc";

export type UsersListResponse = {
	items: IUserCard[];
	nextCursor: string | null;
};

type RawUsersListResponse = {
	items: ProfileCardData[];
	nextCursor: string | null;
};

export async function getUsersList(
	params: UsersQuery,
): Promise<UsersListResponse> {
	const res = await profileApi.get<RawUsersListResponse>("/users/", { params });
	const { items, nextCursor } = res.data;

	const cards = await fetchSessionCards(items.map((u) => u.id));
	const byUserId = new Map(cards.map((c) => [c.userId, c]));

	const enriched: IUserCard[] = items.map((u) => {
		const card = byUserId.get(u.id);
		return {
			...u,
			userId: u.id,
			systemStats: card?.systemStats,
			nextSession: card?.nextSession,
		};
	});

	return { items: enriched, nextCursor };
}
