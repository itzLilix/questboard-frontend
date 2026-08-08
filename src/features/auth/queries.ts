import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchMe, login, logout, signup } from "./api";
import type { IUser } from "../../types/user";

export const authKeys = { me: ["user", "me"] as const };

export function useCurrentUser() {
	return useQuery<IUser | null>({
		queryKey: authKeys.me,
		queryFn: fetchMe,
		staleTime: Infinity,
		retry: false,
	});
}

// Everything except the "me" entry is viewer-dependent (visibility, follow
// flags), so any cache built under the previous identity must be refetched.
function invalidateViewerData(qc: ReturnType<typeof useQueryClient>) {
	qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "user" });
}

export function useLoginMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}) => login(email, password),
		onSuccess: (user) => {
			qc.setQueryData(authKeys.me, user);
			invalidateViewerData(qc);
		},
	});
}

export function useSignupMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			email,
			username,
			password,
			displayName,
		}: {
			email: string;
			username: string;
			password: string;
			displayName: string;
		}) => signup({ email, username, password, displayName }),
		onSuccess: (user) => {
			qc.setQueryData(authKeys.me, user);
			invalidateViewerData(qc);
		},
	});
}

export function useLogoutMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			qc.setQueryData<IUser | null>(authKeys.me, null);
			invalidateViewerData(qc);
		},
	});
}
