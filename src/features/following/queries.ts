import { useQuery } from "@tanstack/react-query";
import { getFollowingList, type UsersQuery } from "./api";

export const followingKeys = {
	all: ["following"] as const,
	list: (params: UsersQuery) => ["following", "list", params] as const,
};

export function useFollowingQuery(params: UsersQuery) {
	return useQuery({
		queryKey: followingKeys.list(params),
		queryFn: () => getFollowingList(params),
	});
}
