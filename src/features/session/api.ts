import { sessionApi } from "../../api/axios";
import type {
	ILocation,
	ISession,
	SessionAvailability,
	SessionFormat,
	SessionStatus,
	SessionType,
} from "../../types/session";
import type { ISystem, SessionCardData } from "../../types/userCard";

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
	masterNotes?: string;
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
	const params = new URLSearchParams();
	for (const id of masterIds) params.append("masterId", id);
	const { data } = await sessionApi.get<SessionCardData[]>(
		"/sessions/cards",
		{
			params,
		},
	);
	return data;
}

export type SessionListQuery = {
	scope?: "catalog" | "mastering" | "playing";
	masterId?: string;
	playerId?: string;
	status: SessionStatus | "public";
	search?: string;
	format?: SessionFormat;
	type?: SessionType;
	city?: string;
	systemId?: string;
	hasFreeSeats?: boolean;
	priceMin?: number;
	priceMax?: number;
	dateFrom?: string;
	dateTo?: string;
	sort?: string;
	order?: "asc" | "desc";
	cursor?: string;
	limit?: number;
};

export type SessionsListResponse = {
	items: ISession[];
	nextCursor: string | null;
};

export async function fetchSessions(
	params: SessionListQuery,
): Promise<SessionsListResponse> {
	const { data } = await sessionApi.get<SessionsListResponse>("/sessions/", {
		params,
	});
	return { items: data.items ?? [], nextCursor: data.nextCursor ?? null };
}
