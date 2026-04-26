export interface ISession {
	id: string;
	title: string;
	format: SessionFormat;
	scheduledAt: string;
	location: string;
	system: string;
	type: SessionType;
	availability: SessionAvailability;
	description: string;
	previewUrl: string;
	maxSeats: number;
	masterId: string;
	price: string;
	masterNotes: string;
	status: SessionStatus;
	freeSeats: number;
	createdAt: string;
	updatedAt: string;
}

export type SessionFormat = "online" | "offline";
export type SessionAvailability = "open" | "private" | "application";
export type SessionStatus =
	| "draft"
	| "published"
	| "ongoing"
	| "completed"
	| "cancelled";
export type SessionType = "oneshot" | "campaign";
