import { useQuery } from "@tanstack/react-query";
import { getUsersList, type UsersQuery } from "./api";

export const usersCatalogKeys = {
	all: ["usersList"] as const,
	detail: (params: UsersQuery) => ["usersList", "catalog", params] as const,
};

export function useUsersCatalogQuery(params: UsersQuery) {
	return useQuery({
		queryKey: usersCatalogKeys.detail(params),
		queryFn: () => getUsersList(params),
	});
}
