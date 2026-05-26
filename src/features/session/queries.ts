import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
	addGameSystem,
	changeSessionStatus,
	createSession,
	fetchCuratedSystems,
	fetchSession,
	fetchSessions,
	searchSystems,
	type CreateSessionPayload,
	type SessionListQuery,
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
		}) => {
			const session = await createSession(input.payload);
			if (input.publish) {
				return changeSessionStatus(session.id, "published");
			}
			return session;
		},
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: sessionKeys.all });
			if (variables.publish) {
				qc.invalidateQueries({ queryKey: usersCatalogKeys.all });
				qc.invalidateQueries({
					queryKey: profileKeys.detail(variables.gmUsername),
				});
			}
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
