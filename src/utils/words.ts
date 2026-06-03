import { CampaignAvailability, CampaignStatus } from "../types/campaign";
import {
	SessionAvailability,
	SessionFormat,
	SessionStatus,
	SessionType,
} from "../types/session";
import { options, type Option } from "./options";

export function pluralPartiy(n: number) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return "партия";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return "партии";
	return "партий";
}

export const MONTHS_GENITIVE = [
	"января",
	"февраля",
	"марта",
	"апреля",
	"мая",
	"июня",
	"июля",
	"августа",
	"сентября",
	"октября",
	"ноября",
	"декабря",
];

export function pluralDays(n: number) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return "день";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
	return "дней";
}

export function pluralSeats(n: number) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return "место";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
		return "места";
	return "мест";
}

export function pluralHours(n: number) {
	const rounded = Math.round(n);
	const mod10 = rounded % 10;
	const mod100 = rounded % 100;
	if (mod10 === 1 && mod100 !== 11) return "час";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "часа";
	return "часов";
}

export function pluralGames(n: number) {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return "игра";
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "игры";
	return "игр";
}

export const DAYS_OF_WEEK = [
	"Воскресенье",
	"Понедельник",
	"Вторник",
	"Среда",
	"Четверг",
	"Пятница",
	"Суббота",
];

export const FORMAT_LABEL: Record<SessionFormat, string> = {
	[SessionFormat.Online]: "Онлайн",
	[SessionFormat.Offline]: "Оффлайн",
};

export const TYPE_LABEL: Record<SessionType, string> = {
	[SessionType.Oneshot]: "Ваншот",
	[SessionType.Campaign]: "Кампания",
};

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
	[CampaignStatus.Active]: "активен",
	[CampaignStatus.Paused]: "приостановлен",
	[CampaignStatus.Completed]: "завершен",
	[CampaignStatus.Cancelled]: "отменён",
};

export const AVAILABILITY_LABEL: Record<SessionAvailability, string> = {
	[SessionAvailability.Open]: "Открытая",
	[SessionAvailability.Application]: "По заявкам",
	[SessionAvailability.Private]: "Закрытая",
};
export const CAMPAIGN_AVAILABILITY_LABEL: Record<CampaignAvailability, string> =
	{
		[CampaignAvailability.Open]: "Публичный",
		[CampaignAvailability.Private]: "Приватный",
	};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
	[SessionStatus.Draft]: "Черновик",
	[SessionStatus.Published]: "Опубликована",
	[SessionStatus.Ongoing]: "Идёт",
	[SessionStatus.Completed]: "Завершена",
	[SessionStatus.Cancelled]: "Отменена",
};

export const SESSION_STATUS_OPTIONS = options([
	{ value: SessionStatus.Draft, label: SESSION_STATUS_LABEL.draft },
	{ value: SessionStatus.Published, label: SESSION_STATUS_LABEL.published },
	{ value: SessionStatus.Ongoing, label: SESSION_STATUS_LABEL.ongoing },
	{ value: SessionStatus.Completed, label: SESSION_STATUS_LABEL.completed },
	{ value: SessionStatus.Cancelled, label: SESSION_STATUS_LABEL.cancelled },
]) satisfies readonly Option<SessionStatus>[];

export const AVAILABILITY_OPTIONS: {
	value: SessionAvailability;
	label: string;
	hint: string;
}[] = [
	{
		value: SessionAvailability.Open,
		label: "Открытая",
		hint: "Любой желающий может записаться",
	},
	{
		value: SessionAvailability.Application,
		label: "По заявкам",
		hint: "Мастер одобряет каждую заявку",
	},
	{
		value: SessionAvailability.Private,
		label: "Закрытая",
		hint: "Только по ссылке",
	},
];

export const FORMAT_OPTIONS = options([
	{ value: SessionFormat.Online, label: "Онлайн" },
	{ value: SessionFormat.Offline, label: "Оффлайн" },
]) satisfies readonly Option<SessionFormat>[];

export const TYPE_OPTIONS = options([
	{ value: SessionType.Oneshot, label: "Ваншот" },
	{ value: SessionType.Campaign, label: "Кампания" },
]) satisfies readonly Option<SessionType>[];

export const MultiSelectState = {
	Included: "included",
	Excluded: "excluded",
} as const;
export type MultiSelectState =
	(typeof MultiSelectState)[keyof typeof MultiSelectState];
