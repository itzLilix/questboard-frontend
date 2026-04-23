import type { Socials } from "../features/socials/types";

export interface IProfile {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
	bannerUrl?: string;
	sessionsPlayed: number;
	sessionsHosted: number;
	rating: number;
	reviewsCount: number;
	bio?: string;
	links?: Socials[];
	isFollowed?: boolean;
}
