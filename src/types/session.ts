import type { ISystem, IUserBrief } from "./userCard";

export const SessionFormat = {
	Online: "online",
	Offline: "offline",
} as const;
export type SessionFormat = (typeof SessionFormat)[keyof typeof SessionFormat];

export const SessionAvailability = {
	Open: "open",
	Private: "private",
	Application: "application",
} as const;
export type SessionAvailability =
	(typeof SessionAvailability)[keyof typeof SessionAvailability];

export const SessionStatus = {
	Draft: "draft",
	Published: "published",
	Ongoing: "ongoing",
	Completed: "completed",
	Cancelled: "cancelled",
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const SessionType = {
	Oneshot: "oneshot",
	Campaign: "campaign",
} as const;
export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export const PlayerStatus = {
	Active: "active",
	Kicked: "kicked",
	Left: "left",
} as const;
export type PlayerStatus = (typeof PlayerStatus)[keyof typeof PlayerStatus];

export const SessionMembership = {
	Player: "player",
	Kicked: "kicked",
	Left: "left",
	Master: "master",
	Applicant: "applicant",
} as const;
export type SessionMembership =
	(typeof SessionMembership)[keyof typeof SessionMembership];

export interface ISession {
	id: string;
	title: string;
	format: SessionFormat;
	scheduledAt: string;
	duration?: number;
	location?: ILocation;
	system: ISystem;
	type: SessionType;
	availability: SessionAvailability;
	description: string;
	previewUrl: string;
	maxSeats: number;
	masterId: string;
	price: number;
	masterNotes: string;
	status: SessionStatus;
	freeSeats: number;
	createdAt: string;
	updatedAt: string;
}

export type ILocation = {
	address: string;
	lat: number;
	lng: number;
};

export type ICharacter = {
	id: string;
	playerId: string;
	name: string;
	class: string | null;
	level: number | null;
	avatarUrl?: string;
	description?: string | null;
	sheetUrl?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type IPlayer = {
	sessionId: string;
	playerId: string;
	status: PlayerStatus;
	joinedAt: string;
	character: ICharacter | null;
};

export type SessionResponse = {
	session: ISession;
	players: IPlayer[];
	users: Record<string, IUserBrief>;
	campaign?: CampaignRef;
	membership: SessionMembership;
};

export type SessionsListResponse = {
	items: ISession[];
	nextCursor: string | null;
	users: Record<string, IUserBrief>;
	campaigns?: Record<string, CampaignRef>;
	membership: Record<string, SessionMembership>;
};

export type CampaignRef = {
	campaignId: string;
	title: string;
	index: number;
};
