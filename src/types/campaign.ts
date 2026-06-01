import { SessionAvailability } from "./session";
import type { ISystem } from "./userCard";

const { Application, ...CampaignAvailability } = SessionAvailability;
export { CampaignAvailability };

export type CampaignAvailability =
	(typeof CampaignAvailability)[keyof typeof CampaignAvailability];

export interface ICampaign {
	id: string;
	title: string;
	description?: string;
	system?: ISystem;
	availability: CampaignAvailability;
	masterId: string;
	status: CampaignStatus;
	createdAt: string;
	updatedAt: string;
	sessionCount: number;
	sessions: CampaignSessionTie[];
}

export const CampaignStatus = {
	Active: "active",
	Paused: "paused",
	Completed: "completed",
	Cancelled: "cancelled",
} as const;

export type CampaignStatus =
	(typeof CampaignStatus)[keyof typeof CampaignStatus];

type CampaignSessionTie = {
	sessionId: string;
	orderIndex: number;
	cachedTitle: string;
	cachedScheduledAt: string;
	briefDescription: string;
};
