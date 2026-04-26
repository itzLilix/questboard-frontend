import type { ISession, SessionFormat, SessionType } from "./session";

export type IUserCard = ProfileCardData & Omit<SessionCardData, "userId">;

interface ProfileCardData {
	id: string;
	username: string;
	displayName: string;
	avatarUrl?: string;
	bannerUrl?: string;
	sessionsPlayed: number;
	sessionsHosted: number;
	rating: number;
	reviewsCount: number;
}
interface SessionCardData {
	systemStats?: ISystem & { sessionsCount: number }[];
	preferredFormats?: SessionFormat[];
	preferredTypes?: SessionType[];
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
