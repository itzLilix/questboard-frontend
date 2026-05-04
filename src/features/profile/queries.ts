import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "./api";

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
