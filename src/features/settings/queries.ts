import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateProfile,
	uploadAvatar,
	deleteAvatar,
	uploadBanner,
	deleteBanner,
} from "./api";
import { authKeys } from "../auth/queries";
import { profileKeys } from "../profile/queries";
import type { Socials } from "../socials/types";
import type { IUser } from "../../types/user";

export type UpdateProfileInput = {
	displayName: string;
	username: string;
	bio: string;
	links: Socials[];
};

export type SaveProfileInput = {
	patch: Partial<UpdateProfileInput>;
	avatar: File | null | "unchanged";
	banner: File | null | "unchanged";
};

export function useUpdateProfileMutation() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async ({ patch, avatar, banner }: SaveProfileInput) => {
			const calls: Promise<IUser>[] = [];

			if (Object.keys(patch).length > 0) calls.push(updateProfile(patch));

			if (avatar instanceof File) calls.push(uploadAvatar(avatar));
			else if (avatar === null) calls.push(deleteAvatar());

			if (banner instanceof File) calls.push(uploadBanner(banner));
			else if (banner === null) calls.push(deleteBanner());

			await Promise.all(calls);
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: authKeys.me });
			qc.invalidateQueries({ queryKey: profileKeys.all });
		},
	});
}
