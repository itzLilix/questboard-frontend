import { pluralDays, MONTHS_GENITIVE, DAYS_OF_WEEK } from "./words";

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

export function formatDateWeekday(key: string): string {
	if (key === "no-date") return "Без даты";
	const [y, m, d] = key.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	const day = date.getDate();
	const month = MONTHS_GENITIVE[date.getMonth()];
	const weekday = DAYS_OF_WEEK[date.getDay()];
	return `${day} ${month}, ${weekday}`;
}

export function dateKey(iso: string | undefined): string {
	if (!iso) return "no-date";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "no-date";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}
