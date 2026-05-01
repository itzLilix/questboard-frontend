import { useCurrentUser } from "../features/auth/queries";

export default function useAuth() {
	const { data: user, isLoading } = useCurrentUser();
	return { user: user ?? null, isLoading };
}
