import type { Socials } from "../features/socials/types";

export interface IUser {
	id: string;
	username: string;
	email: string;
	createdAt: string;
	lastLogin?: string;
	avatarUrl?: string;
	bannerUrl?: string;
	role: "user" | "admin";
	displayName: string;
	isEmailVerified: boolean;
	sessionsPlayed: number;
	sessionsHosted: number;
	rating: number;
	reviewsCount: number;
	bio?: string;
	links?: Socials[];
}
