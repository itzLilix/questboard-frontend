import { useCurrentUser } from "./queries";

export default function useAuth() {
	const { data: user, isLoading } = useCurrentUser();
	return { user: user ?? null, isLoading };
}
