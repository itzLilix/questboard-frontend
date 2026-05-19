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
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "места";
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

export function formatRelativeDate(iso: string): string {
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";

	const now = new Date();
	const startOfDay = (d: Date) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	const dayDiff = Math.round(
		(startOfDay(date) - startOfDay(now)) / (1000 * 60 * 60 * 24),
	);

	if (dayDiff === 0) return "сегодня";
	if (dayDiff === 1) return "завтра";
	if (dayDiff === -1) return "вчера";
	if (dayDiff > 1 && dayDiff <= 7)
		return `через ${dayDiff} ${pluralDays(dayDiff)}`;
	if (dayDiff < -1 && dayDiff >= -7) {
		const n = -dayDiff;
		return `${n} ${pluralDays(n)} назад`;
	}

	return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}
