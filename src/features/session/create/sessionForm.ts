import { SessionAvailability, SessionFormat } from "../../../types/session";
import type { ISystem } from "../../../types/userCard";

export interface SessionFormValues {
	campaignId: string | null;
	title: string;
	description: string;
	image: File | null;
	system: ISystem | null;
	format: SessionFormat;
	location: string;
	scheduledAt: string;
	startTime: string;
	durationHours: number;
	maxSeats: number;
	price: string;
	isFree: boolean;
	availability: SessionAvailability;
}

export const sessionFormDefaults: SessionFormValues = {
	campaignId: null,
	title: "",
	description: "",
	image: null,
	system: null,
	format: SessionFormat.Offline,
	location: "",
	scheduledAt: "",
	startTime: "",
	durationHours: 4,
	maxSeats: 4,
	price: "",
	isFree: false,
	availability: SessionAvailability.Open,
};

export const titleRules = {
	required: "Название обязательно",
	minLength: { value: 3, message: "Минимум 3 символа" },
	maxLength: { value: 255, message: "Максимум 255 символов" },
};

export const descriptionRules = {
	maxLength: { value: 2000, message: "Максимум 2000 символов" },
};

export const seatsRules = {
	required: "Укажите количество мест",
	min: { value: 1, message: "Минимум 1 место" },
	max: { value: 50, message: "Максимум 50 мест" },
};
