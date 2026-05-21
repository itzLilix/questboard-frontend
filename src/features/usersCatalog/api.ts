import { profileApi } from "../../api/axios";
import type { SessionFormat, SessionType } from "../../types/session";
import type { IUserCard, ProfileCardData } from "../../types/userCard";
import type { SortOrder } from "../../types/query";
import { fetchSessionCards } from "../session/api";

export type UsersQuery = {
	search?: string;
	format?: SessionFormat;
	type?: SessionType;
	city?: string;
	minRating?: number;
	followedBy?: string;
	onlyGMs?: boolean;
	sort?: UserSortBy;
	order?: SortOrder;
	cursor?: string;
	limit?: number;
};

export const UserSortBy = {
	Rating: "rating",
	Recent: "recent",
	FollowedAt: "followedAt",
	Reviews: "reviews",
	Sessions: "sessions",
} as const;
export type UserSortBy = (typeof UserSortBy)[keyof typeof UserSortBy];

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
