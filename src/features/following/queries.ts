import { useMutation, useQuery } from "@tanstack/react-query";
import {
	getFollowingList,
	type UsersListResponse,
	type UsersQuery,
} from "./api";
import { queryClient } from "../../api/queryClient";
import type { IProfile } from "../../types/profile";
import { followUser, unfollowUser } from "./api";
import { profileKeys } from "../profile/queries";

export const followingKeys = {
	all: ["usersList"] as const,
	detail: (params: UsersQuery) => ["usersList", "following", params] as const,
};

export function useFollowingQuery(params: UsersQuery) {
	return useQuery({
		queryKey: followingKeys.detail(params),
		queryFn: () => getFollowingList(params),
	});
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

			qc.setQueriesData<UsersListResponse>(
				{ queryKey: listKey },
				(old) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((u) =>
							u.username === username
								? { ...u, isFollowed: true }
								: u,
						),
					};
				},
			);

			return { previous };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) qc.setQueryData(profileKey, ctx.previous);
			qc.invalidateQueries({ queryKey: listKey });
		},
		onSettled: () => qc.invalidateQueries({ queryKey: profileKey }),
	});
}

export function useUnfollowMutation(username: string) {
	const listKey = followingKeys.all;

	return useMutation({
		mutationFn: () => unfollowUser(username),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: profileKeys.detail(username),
			});

			queryClient.setQueriesData<UsersListResponse>(
				{ queryKey: listKey },
				(old) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((u) =>
							u.username === username
								? { ...u, isFollowed: false }
								: u,
						),
					};
				},
			);
		},
	});
}
