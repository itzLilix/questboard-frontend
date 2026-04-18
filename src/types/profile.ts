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
