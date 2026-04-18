import { useMutation, useQuery } from "@tanstack/react-query";
import { followUser, getUserProfile, unfollowUser } from "./api";
import { queryClient } from "../../api/queryClient";
import type { IProfile } from "../../types/profile";

export const profileKeys = {
	all: ["profile"] as const,
	detail: (username: string) => ["profile", username] as const,
};

export function useProfileQuery(username: string | undefined) {
	return useQuery({
		queryKey: profileKeys.detail(username ?? ""),
		queryFn: () => getUserProfile(username!),
		enabled: !!username,
	});
}

export function useFollowMutation(username: string) {
	const key = profileKeys.detail(username);
	const qc = queryClient;

	return useMutation({
		mutationFn: () => followUser(username),
		onMutate: async () => {
			await qc.cancelQueries({ queryKey: key });
			const previous = qc.getQueryData<IProfile>(key);
			if (previous) {
				qc.setQueryData<IProfile>(key, {
					...previous,
					isFollowed: true,
				});
			}
			return { previous };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) qc.setQueryData(key, ctx.previous);
		},
		onSettled: () => qc.invalidateQueries({ queryKey: key }),
	});
}

export function useUnfollowMutation(username: string) {
	return useMutation({
		mutationFn: () => unfollowUser(username),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: profileKeys.detail(username),
			});
		},
	});
}
