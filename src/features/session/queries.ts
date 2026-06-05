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
	changeCampaignStatus,
	changeSessionStatus,
	createCampaign,
	createSession,
	deleteCampaign,
	deleteSession,
	editTie,
	fetchCampaign,
	fetchCampaigns,
	fetchCampaignSessions,
	fetchCuratedSystems,
	fetchSession,
	fetchSessions,
	joinSession,
	reorderCampaignSessions,
	searchSystems,
	tieSession,
	untieSession,
	updateCampaign,
	updateSession,
	type CampaignListQuery,
	type CampaignsListResponse,
	type CreateSessionPayload,
	type SessionListQuery,
	type TieSessionQuery,
	type UpdateCampaignPayload,
	type UpdateSessionPayload,
} from "./api";
import { usersCatalogKeys } from "../usersCatalog/queries";
import { profileKeys } from "../profile/queries";
import type { CampaignRef, SessionStatus } from "../../types/session";
import type { CampaignStatus } from "../../types/campaign";

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
	lists: ["campaigns", "list"] as const,
	list: (params: CampaignListQuery) => ["campaigns", "list", params] as const,
	detail: (id: string | undefined) => ["campaigns", id] as const,
	sessions: (id: string) => ["campaigns", id, "sessions"] as const,
};

export function useCampaignSessionsQuery(
	campaignId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: campaignKeys.sessions(campaignId),
		queryFn: () => fetchCampaignSessions(campaignId),
		enabled: options?.enabled,
	});
}

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

export function useCampaignDetailQuery(campaignId: string | undefined) {
	return useQuery({
		queryKey: campaignKeys.detail(campaignId),
		queryFn: () => fetchCampaign(campaignId!),
		enabled: !!campaignId,
	});
}

export function useCreateCampaignMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCampaign,
		onSuccess: (campaign) => {
			qc.setQueriesData<InfiniteData<CampaignsListResponse>>(
				{ queryKey: campaignKeys.lists },
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

export function useSaveCampaignMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			campaignId: string;
			unties: string[];
			reorder?: string[];
			briefEdits: { sessionId: string; briefDescription: string }[];
			campaignPatch?: UpdateCampaignPayload;
			status?: CampaignStatus;
		}) => {
			for (const sessionId of input.unties) {
				await untieSession(input.campaignId, sessionId);
			}
			if (input.reorder) {
				await reorderCampaignSessions(input.campaignId, input.reorder);
			}
			for (const edit of input.briefEdits) {
				await editTie(input.campaignId, edit.sessionId, {
					briefDescription: edit.briefDescription,
				});
			}
			if (
				input.campaignPatch &&
				Object.keys(input.campaignPatch).length > 0
			) {
				await updateCampaign(input.campaignId, input.campaignPatch);
			}
			if (input.status) {
				await changeCampaignStatus(input.campaignId, input.status);
			}
		},
		onSuccess: (_, variables) => {
			qc.invalidateQueries({
				queryKey: campaignKeys.detail(variables.campaignId),
			});
			qc.invalidateQueries({ queryKey: campaignKeys.all });
			qc.invalidateQueries({ queryKey: sessionKeys.all });
		},
	});
}

export function useDeleteCampaignMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (campaignId: string) => deleteCampaign(campaignId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: campaignKeys.all });
			qc.invalidateQueries({ queryKey: sessionKeys.all });
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

export function collectCampaigns(
	pages: { campaigns?: Record<string, CampaignRef> }[] | undefined,
): Record<string, CampaignRef> {
	return (
		pages?.reduce<Record<string, CampaignRef>>(
			(acc, page) => Object.assign(acc, page.campaigns),
			{},
		) ?? {}
	);
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

export function useSaveSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			sessionId: string;
			gmUsername: string;
			patch?: UpdateSessionPayload;
			status?: SessionStatus;
			campaignChange?: { from: string | null; to: string | null };
		}) => {
			if (input.patch && Object.keys(input.patch).length > 0) {
				await updateSession(input.sessionId, input.patch);
			}
			if (input.status) {
				await changeSessionStatus(input.sessionId, input.status);
			}
			const change = input.campaignChange;
			if (change && change.from !== change.to) {
				if (change.from) {
					await untieSession(change.from, input.sessionId);
				}
				if (change.to) {
					await tieSession(change.to, { sessionId: input.sessionId });
				}
			}
		},
		onSuccess: (_, variables) => {
			qc.invalidateQueries({
				queryKey: sessionKeys.detail(variables.sessionId),
			});
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			qc.invalidateQueries({ queryKey: campaignKeys.all });
			qc.invalidateQueries({ queryKey: usersCatalogKeys.all });
			qc.invalidateQueries({
				queryKey: profileKeys.detail(variables.gmUsername),
			});
		},
	});
}

export function useDeleteSessionMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: { sessionId: string; gmUsername: string }) =>
			deleteSession(input.sessionId),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			qc.invalidateQueries({ queryKey: campaignKeys.all });
			qc.invalidateQueries({ queryKey: usersCatalogKeys.all });
			qc.invalidateQueries({
				queryKey: profileKeys.detail(variables.gmUsername),
			});
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

export function useJoinSessionMutation() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (sessionId: string) => joinSession(sessionId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
		},
	});
}
