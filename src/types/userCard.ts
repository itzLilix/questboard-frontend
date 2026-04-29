import type { ISession, SessionFormat, SessionType } from "./session";

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
	systemStats?: ISystem & { sessionsCount: number }[];
	nextSession?: INextSession;
}

export type INextSession = Pick<
	ISession,
	"scheduledAt" | "format" | "system" | "type"
>;

export type ISystem = {
	slug: string;
	name: string;
};
