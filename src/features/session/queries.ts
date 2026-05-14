import { useQuery } from "@tanstack/react-query";
import { fetchCuratedSystems, searchSystems } from "./api";

const DAY_MS = 1000 * 60 * 60 * 24;

export const gameSystemKeys = {
	all: ["game-systems"] as const,
	curated: ["game-systems", "curated"] as const,
	search: (q: string) => ["game-systems", q] as const,
};

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
		queryKey: gameSystemKeys.search(search),
		queryFn: () => searchSystems(search),
		enabled: !!search.trim(),
	});
}
