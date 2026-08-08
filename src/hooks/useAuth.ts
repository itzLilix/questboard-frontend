import { useCurrentUser } from "../features/auth/queries";

function useAuth() {
	const { data: user, isLoading } = useCurrentUser();
	return { user: user ?? null, isLoading };
}
