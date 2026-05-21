import type { Socials } from "../features/socials/types";

export const UserRole = {
	User: "user",
	Admin: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface IUser {
	id: string;
	username: string;
	email: string;
	createdAt: string;
	lastLogin?: string;
	avatarUrl?: string;
	bannerUrl?: string;
	role: UserRole;
	displayName: string;
	isEmailVerified: boolean;
	sessionsPlayed: number;
	sessionsHosted: number;
	rating: number;
	reviewsCount: number;
	bio?: string;
	links?: Socials[];
}
