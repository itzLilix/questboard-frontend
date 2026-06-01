import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
	addGameSystem,
	changeSessionStatus,
	createCampaign,
	createSession,
	fetchCampaigns,
	fetchCuratedSystems,
	fetchSession,
	fetchSessions,
	searchSystems,
	tieSession,
	type CampaignListQuery,
	type CampaignsListResponse,
	type CreateSessionPayload,
	type SessionListQuery,
	type TieSessionQuery,
} from "./api";
import { usersCatalogKeys } from "../usersCatalog/queries";
import { profileKeys } from "../profile/queries";

const DAY_MS = 1000 * 60 * 60 * 24;

export const gameSystemKeys = {
	all: ["game-systems"] as const,
	curated: ["game-systems", "curated"] as const,
	searchAll: ["game-systems", "search"] as const,
	searchDetail: (q: string) => ["game-systems", "search", q] as const,
};

export const sessionKeys = {
	all: ["sessions"] as const,
	list: (params: SessionListQuery) => ["sessions", "list", params] as const,
	detail: (id: string) => ["sessions", id] as const,
};

export const campaignKeys = {
	all: ["campaigns"] as const,
	list: (params: CampaignListQuery) => ["campaigns", "list", params] as const,
};

export function useCampaignsQuery(
	params: CampaignListQuery = {},
	options?: { enabled?: boolean },
) {
	return useInfiniteQuery({
		queryKey: campaignKeys.list(params),
		queryFn: ({ pageParam }) =>
			fetchCampaigns({ ...params, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: options?.enabled,
	});
}

export function useCreateCampaignMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCampaign,
		onSuccess: (campaign) => {
			qc.setQueriesData<InfiniteData<CampaignsListResponse>>(
				{ queryKey: campaignKeys.all },
				(old) => {
					if (!old || old.pages.length === 0) return old;
					const [first, ...rest] = old.pages;
					return {
						...old,
						pages: [
							{ ...first, items: [campaign, ...first.items] },
							...rest,
						],
					};
				},
			);
			qc.invalidateQueries({ queryKey: campaignKeys.all });
		},
	});
}

export function useSessionsQuery(params: SessionListQuery) {
	return useInfiniteQuery({
		queryKey: sessionKeys.list(params),
		queryFn: ({ pageParam }) =>
			fetchSessions({ ...params, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
}

export function useCuratedSystemsQuery() {
	return useQuery({
		queryKey: gameSystemKeys.curated,
		queryFn: fetchCuratedSystems,
		staleTime: DAY_MS,
		gcTime: DAY_MS,
	});
}

export function useSystemSearchQuery(search: string) {
	return useQuery({
		queryKey: gameSystemKeys.searchDetail(search),
		queryFn: () => searchSystems(search),
		enabled: !!search.trim(),
	});
}

export function useCreateSystemMutation(name: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => addGameSystem(name),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: gameSystemKeys.searchAll });
		},
		throwOnError: (error) =>
			!(isAxiosError(error) && error.response?.status === 409),
	});
}

export function useCreateSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			payload: CreateSessionPayload;
			publish: boolean;
			gmUsername: string;
			campaignId?: string;
			tie?: Omit<TieSessionQuery, "sessionId">;
		}) => {
			const session = await createSession(input.payload);
			if (input.campaignId) {
				await tieSession(input.campaignId, {
					sessionId: session.id,
					...input.tie,
				});
			}
			if (input.publish) {
				return changeSessionStatus(session.id, "published");
			}
			return session;
		},
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			if (variables.campaignId) {
				qc.invalidateQueries({ queryKey: campaignKeys.all });
			}
			if (variables.publish) {
				qc.invalidateQueries({ queryKey: usersCatalogKeys.all });
				qc.invalidateQueries({
					queryKey: profileKeys.detail(variables.gmUsername),
				});
			}
		},
	});
}

export function useTieSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: { campaignId: string; payload: TieSessionQuery }) =>
			tieSession(input.campaignId, input.payload),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: campaignKeys.all });
			qc.invalidateQueries({
				queryKey: sessionKeys.detail(variables.payload.sessionId),
			});
		},
	});
}

export function useFetchSessionQuery(id: string | undefined) {
	return useQuery({
		queryKey: sessionKeys.detail(id ?? ""),
		queryFn: () => fetchSession(id!),
		enabled: !!id,
	});
}
