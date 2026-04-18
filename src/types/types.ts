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
	links?: {
		icon: string;
		url: string;
	}[];
}

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
	links?: {
		icon: string;
		url: string;
	}[];
	isFollowed?: boolean;
}
