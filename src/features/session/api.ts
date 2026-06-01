import { sessionApi } from "../../api/axios";
import {
	SessionStatus,
	type CampaignRef,
	type ILocation,
	type ISession,
	type SessionAvailability,
	type SessionFormat,
	type SessionResponse,
	type SessionType,
} from "../../types/session";
import type {
	IUserBrief,
	ISystem,
	SessionCardData,
} from "../../types/userCard";
import type { SortOrder } from "../../types/query";
import type {
	CampaignAvailability,
	CampaignStatus,
	ICampaign,
} from "../../types/campaign";

export const SessionScope = {
	Catalog: "catalog",
	Mastering: "mastering",
	Playing: "playing",
} as const;
export type SessionScope = (typeof SessionScope)[keyof typeof SessionScope];

export const StatusFilter = {
	...SessionStatus,
	Public: "public",
} as const;
export type StatusFilter = (typeof StatusFilter)[keyof typeof StatusFilter];

export const SessionSortBy = {
	ScheduledAt: "scheduled_at",
	CreatedAt: "created_at",
	System: "system",
	Price: "price",
	Title: "title",
} as const;
export type SessionSortBy = (typeof SessionSortBy)[keyof typeof SessionSortBy];

export async function fetchCuratedSystems(): Promise<ISystem[]> {
	const { data } = await sessionApi.get<ISystem[]>("/game-systems/curated");
	return data;
}

export async function searchSystems(q: string) {
	const { data } = await sessionApi.get<ISystem[]>("/game-systems", {
		params: { q },
	});
	return data;
}

export async function addGameSystem(name: string) {
	const { data } = await sessionApi.post<ISystem>("/game-systems", {
		name: name,
	});
	return data;
}

export type CreateSessionPayload = {
	title: string;
	format: SessionFormat;
	systemId: string;
	maxSeats: number;
	scheduledAt?: string;
	description?: string;
	location?: ILocation;
	durationHours?: number;
	price?: number;
	availability?: SessionAvailability;
	previewUrl?: string;
};

export async function createSession(
	payload: CreateSessionPayload,
): Promise<ISession> {
	const { data } = await sessionApi.post<ISession>("/sessions", payload);
	return data;
}

export async function changeSessionStatus(
	id: string,
	status: SessionStatus,
): Promise<ISession> {
	const { data } = await sessionApi.patch<ISession>(
		`/sessions/${id}/status`,
		{ status },
	);
	return data;
}

export async function fetchSessionCards(
	masterIds: string[],
): Promise<SessionCardData[]> {
	if (masterIds.length === 0) return [];
	const { data } = await sessionApi.get<SessionCardData[]>(
		"/sessions/cards",
		{
			params: { masterId: masterIds },
		},
	);
	return data;
}

export type SessionListQuery = {
	scope?: SessionScope;
	masterId?: string;
	playerId?: string;
	status: StatusFilter;
	search?: string;
	format?: SessionFormat;
	type?: SessionType;
	city?: string;
	systemIncluded?: string[];
	systemExcluded?: string[];
	freeSeats?: number;
	priceMin?: number;
	priceMax?: number;
	dateFrom?: string;
	dateTo?: string;
	sort?: SessionSortBy;
	order?: SortOrder;
	cursor?: string;
	limit?: number;
};

export type SessionsListResponse = {
	items: ISession[];
	nextCursor: string | null;
	users: Record<string, IUserBrief>;
	campaigns?: Record<string, CampaignRef>;
};

export async function fetchSessions(
	params: SessionListQuery,
): Promise<SessionsListResponse> {
	const { data } = await sessionApi.get<SessionsListResponse>("/sessions/", {
		params,
	});
	return {
		items: data.items ?? [],
		nextCursor: data.nextCursor ?? null,
		users: data.users ?? {},
		campaigns: data.campaigns ?? {},
	};
}

export async function fetchSession(id: string): Promise<SessionResponse> {
	const { data } = await sessionApi.get<SessionResponse>(`/sessions/${id}`);
	return data;
}

export type CreateCampaignPayload = {
	title: string;
	description?: string;
	availability: CampaignAvailability;
	systemId?: string;
};

export async function createCampaign(
	payload: CreateCampaignPayload,
): Promise<ICampaign> {
	const { data } = await sessionApi.post<ICampaign>("/campaigns", payload);
	return data;
}

export const CampaignSortBy = {
	CreatedAt: "created_at",
	Title: "title",
	Status: "status",
} as const;
export type CampaignSortBy =
	(typeof CampaignSortBy)[keyof typeof CampaignSortBy];

export type CampaignListQuery = {
	search?: string;
	masterId?: string;
	systemId?: string;
	status?: CampaignStatus;
	sort?: CampaignSortBy;
	order?: SortOrder;
	cursor?: string;
	limit?: number;
};

export type CampaignsListResponse = {
	items: ICampaign[];
	nextCursor: string | null;
};

export async function fetchCampaigns(
	params: CampaignListQuery,
): Promise<CampaignsListResponse> {
	const { data } = await sessionApi.get<CampaignsListResponse>("/campaigns", {
		params,
	});
	return {
		items: data.items ?? [],
		nextCursor: data.nextCursor ?? null,
	};
}

export async function fetchCampaignSessions(
	campaignId: string,
): Promise<ISession[]> {
	const { data } = await sessionApi.get<ISession[] | { items?: ISession[] }>(
		`/campaigns/${campaignId}/sessions`,
	);
	return Array.isArray(data) ? data : (data.items ?? []);
}

export type TieSessionQuery = {
	sessionId: string;
	orderIndex?: number;
	briefDescription?: string;
};

export async function tieSession(campaignId: string, payload: TieSessionQuery) {
	await sessionApi.post(`/campaigns/${campaignId}/sessions`, payload);
}
