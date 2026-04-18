import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchMe, login, logout, signup } from "./api";

const authKeys = { me: ["user", "me"] as const };

export function useCurrentUser() {
	return useQuery({
		queryKey: authKeys.me,
		queryFn: fetchMe,
		staleTime: Infinity,
		retry: false,
	});
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
		onSuccess: (user) => qc.setQueryData(authKeys.me, user),
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
		onSuccess: (user) => qc.setQueryData(authKeys.me, user),
	});
}

export function useLogoutMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: logout,
		onSuccess: () => qc.removeQueries({ queryKey: authKeys.me }),
	});
}
