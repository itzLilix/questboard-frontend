import { pluralDays, MONTHS_GENITIVE, DAYS_OF_WEEK } from "./words";

export function formatDateRelative(iso: string | undefined): string {
	if (!iso || iso === "—") return "—";
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

export function formatDateWeekday(iso: string | undefined): string {
	if (!iso || iso === "—") return "—";
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	const day = date.getDate();
	const month = MONTHS_GENITIVE[date.getMonth()];
	const weekday = DAYS_OF_WEEK[date.getDay()];
	return `${day} ${month}, ${weekday}`;
}

export function formatDate(iso: string | undefined): string {
	if (!iso || iso === "—") return "—";
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	const d = date.getDate();
	const m = MONTHS_GENITIVE[date.getMonth()];
	const y = date.getFullYear();
	return `${d} ${m} ${y}`;
}

export function timeAddTz(time: string | undefined): string {
	if (!time) return "—";
	const tzOffset = new Date().getTimezoneOffset() / -60;
	const tz = `GMT${tzOffset >= 0 ? "+" : ""}${tzOffset}`;
	return `${time} / ${tz}`;
}

export function formatDatetime(iso: string | undefined): string {
	if (!iso || iso === "—") return "—";
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	const d = date.getDate();
	const m = MONTHS_GENITIVE[date.getMonth()];
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	const tzOffset = -date.getTimezoneOffset() / 60;
	const tz = `GMT${tzOffset >= 0 ? "+" : ""}${tzOffset}`;
	return `${d} ${m}, ${hh}:${mm} / ${tz}`;
}

export function dateKey(iso: string | undefined): string {
	if (!iso || iso === "—") return "—";
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function splitDatetime(iso: string | undefined): {
	date: string;
	time: string;
} {
	if (!iso || iso === "—") return { date: "—", time: "—" };
	const d = new Date(iso);
	if (isNaN(d.getTime())) return { date: "—", time: "—" };
	const date = `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
	const hh = String(d.getHours()).padStart(2, "0");
	const mm = String(d.getMinutes()).padStart(2, "0");
	const tz = -d.getTimezoneOffset() / 60;
	const time = `${hh}:${mm} / GMT${tz >= 0 ? "+" + tz : tz}`;
	return { date, time };
}
