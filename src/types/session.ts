import type { ISystem } from "./userCard";

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

export type ISessionCard = ISession & { masterDisplayName: string };

export type ILocation = {
	address: string;
	lat: number;
	lng: number;
};

export type SessionFormat = "online" | "offline";
export type SessionAvailability = "open" | "private" | "application";
export type SessionStatus =
	| "draft"
	| "published"
	| "ongoing"
	| "completed"
	| "cancelled";
export type SessionType = "oneshot" | "campaign";

export type Campaign = {
	id: string;
	title: string;
	description: string;
	system: ISystem;
	status: "active" | "completed" | "cancelled" | "paused";
};
