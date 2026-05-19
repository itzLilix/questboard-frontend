import type { SessionFormat, SessionType } from "./session";

export type IUserCard = ProfileCardData & Omit<SessionCardData, "userId">;

export interface ProfileCardData {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
	bannerUrl?: string;
	rating: number;
	reviewsCount: number;
	sessionsPlayed: number;
	sessionsHosted: number;
	preferredFormat?: SessionFormat;
	preferredType?: SessionType;
	isFollowed: boolean;
}

export interface SessionCardData {
	userId: string;
	systemStats?: ISystemStat[];
	nextSession?: INextSession;
}

export type ISystemStat = ISystem & { sessionsCount: number };

export type INextSession = {
	scheduledAt: string;
	format: SessionFormat;
	type: SessionType;
	system: ISystem;
};

export type ISystem = {
	id: string;
	slug: string;
	name: string;
	isCurated: boolean;
	badgeColor?: string;
};
