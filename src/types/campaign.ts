import { SessionAvailability } from "./session";
import type { ISystem } from "./userCard";

const { Application, ...CampaignAvailability } = SessionAvailability;
export { CampaignAvailability };

export type CampaignAvailability =
	(typeof CampaignAvailability)[keyof typeof CampaignAvailability];

export interface ICampaign {
	id: string;
	title: string;
	description: string | null;
	system: ISystem | null;
	availability: CampaignAvailability;
	masterId: string;
	status: CampaignStatus;
	createdAt: string;
	updatedAt: string;
}

export const CampaignStatus = {
	Active: "active",
	Paused: "paused",
	Completed: "completed",
	Cancelled: "cancelled",
} as const;

export type CampaignStatus =
	(typeof CampaignStatus)[keyof typeof CampaignStatus];
