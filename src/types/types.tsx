export interface IUser {
	username: string;
	email: string;
	avatarUrl?: string;
	bannerUrl?: string;
	role: "user" | "admin";
	accessToken?: string;
	displayName?: string;
	isEmailVerified: boolean;
	sessionsPlayed: number;
	sessionsHosted: number;
	rating: number;
	reviewsCount: number;
}
