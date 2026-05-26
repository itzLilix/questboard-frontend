import { useInfiniteQuery } from "@tanstack/react-query";
import { getUsersList, type UsersQuery } from "./api";

export const usersCatalogKeys = {
	all: ["usersList"] as const,
	detail: (params: UsersQuery) => ["usersList", "catalog", params] as const,
};

export function useUsersCatalogQuery(params: UsersQuery) {
	return useInfiniteQuery({
		queryKey: usersCatalogKeys.detail(params),
		queryFn: ({ pageParam }) =>
			getUsersList({ ...params, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
}
