import {
	useInfiniteQuery,
	useMutation,
	type InfiniteData,
} from "@tanstack/react-query";
import {
	getUsersList,
	type UsersListResponse,
	type UsersQuery,
} from "../usersCatalog/api";
import { queryClient } from "../../api/queryClient";
import type { IProfile } from "../../types/profile";
import { followUser, unfollowUser } from "./api";
import { profileKeys } from "../profile/queries";

export const followingKeys = {
	all: ["usersList"] as const,
	followingAll: ["usersList", "following"] as const,
	detail: (params: UsersQuery) => ["usersList", "following", params] as const,
};

export function useFollowingQuery(params: UsersQuery) {
	return useInfiniteQuery({
		queryKey: followingKeys.detail(params),
		queryFn: ({ pageParam }) =>
			getUsersList({ ...params, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: 10 * 1000,
	});
}

function patchUserInLists(
	listKey: readonly unknown[],
	username: string,
	updater: (
		item: UsersListResponse["items"][number],
	) => UsersListResponse["items"][number],
) {
	queryClient.setQueriesData<InfiniteData<UsersListResponse>>(
		{ queryKey: listKey },
		(old) => {
			if (!old) return old;
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					items: page.items.map((u) =>
						u.username === username ? updater(u) : u,
					),
				})),
			};
		},
	);
}

export function useFollowMutation(username: string) {
	const profileKey = profileKeys.detail(username);
	const listKey = followingKeys.all;
	const qc = queryClient;

	return useMutation({
		mutationFn: () => followUser(username),
		onMutate: async () => {
			await qc.cancelQueries({ queryKey: profileKey });
			await qc.cancelQueries({ queryKey: listKey });

			const previous = qc.getQueryData<IProfile>(profileKey);

			if (previous) {
				qc.setQueryData<IProfile>(profileKey, {
					...previous,
					isFollowed: true,
				});
			}

			patchUserInLists(listKey, username, (u) => ({
				...u,
				isFollowed: true,
			}));

			return { previous };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) qc.setQueryData(profileKey, ctx.previous);
			qc.invalidateQueries({ queryKey: listKey });
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: profileKey });
			qc.invalidateQueries({ queryKey: followingKeys.followingAll });
		},
	});
}

export function useUnfollowMutation(username: string) {
	const listKey = followingKeys.all;
	const qc = queryClient;

	return useMutation({
		mutationFn: () => unfollowUser(username),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: profileKeys.detail(username),
			});
			qc.invalidateQueries({
				queryKey: followingKeys.followingAll,
				refetchType: "inactive",
			});

			patchUserInLists(listKey, username, (u) => ({
				...u,
				isFollowed: false,
			}));
		},
	});
}
