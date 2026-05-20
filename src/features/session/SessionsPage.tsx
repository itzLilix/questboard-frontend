import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import ClearFiltersButton from "../../components/ui/ClearFiltersButton";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/FilterToggle";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/inputs/Input";
import Loading from "../../components/ui/Loading";
import SessionCard from "../../components/ui/cards/SessionCard";
import { SystemBadge } from "../../components/ui/SystemBadge";
import type { ISession, SessionFormat, SessionType } from "../../types/session";
import type { ISystem, IUserBrief } from "../../types/userCard";
import { type Option, options, type OptionValue } from "../../utils/options";
import { DAYS_OF_WEEK, MONTHS_GENITIVE } from "../../utils/words";
import { useCuratedSystemsQuery, useSessionsQuery } from "./queries";
import SessionGroup from "./SessionGroup";
import ToggleSortOrder from "../../components/ui/ToggleSortOrder";

const FORMAT_OPTIONS = options([
	{ value: "online", label: "Онлайн" },
	{ value: "offline", label: "Оффлайн" },
]) satisfies readonly Option<SessionFormat>[];

const TYPE_OPTIONS = options([
	{ value: "oneshot", label: "Ваншот" },
	{ value: "campaign", label: "Кампания" },
]) satisfies readonly Option<SessionType>[];

const SORT_OPTIONS = options([
	{ value: "scheduled_at", label: "Дата проведения" },
	{ value: "created_at", label: "Дата создания" },
	{ value: "system", label: "Система" },
	{ value: "price", label: "Цена" },
	{ value: "title", label: "Название" },
]);

type SessionSortBy = OptionValue<typeof SORT_OPTIONS>;

const DATE_FIELD_BY_SORT = {
	scheduled_at: "scheduledAt",
	created_at: "createdAt",
} as const satisfies Partial<Record<SessionSortBy, keyof ISession>>;

type DateSort = keyof typeof DATE_FIELD_BY_SORT;
type GroupBy =
	| { kind: "date"; field: (typeof DATE_FIELD_BY_SORT)[DateSort] }
	| { kind: "system" }
	| null;

function getGroupBy(sort: SessionSortBy): GroupBy {
	if (sort in DATE_FIELD_BY_SORT) {
		return {
			kind: "date",
			field: DATE_FIELD_BY_SORT[sort as DateSort],
		};
	}
	if (sort === "system") return { kind: "system" };
	return null;
}

export default function SessionsPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [format, setFormat] = useState<SessionFormat | null>(null);
	const [type, setType] = useState<SessionType | null>(null);
	const [systemId, setSystemId] = useState<string | null>(null);
	const [hasFreeSeats, setHasFreeSeats] = useState(false);
	const [isFree, setIsFree] = useState(false);
	const [priceMin, setPriceMin] = useState("");
	const [priceMax, setPriceMax] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState<SessionSortBy>("scheduled_at");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	const clearFilters = () => {
		setSearch("");
		setFormat(null);
		setType(null);
		setSystemId(null);
		setHasFreeSeats(false);
		setIsFree(false);
		setPriceMin("");
		setPriceMax("");
		setDateFrom("");
		setDateTo("");
	};

	const { data: curated = [] } = useCuratedSystemsQuery();
	const systemOptions = useMemo(
		() => curated.map((s) => ({ value: s.id, label: s.name })),
		[curated],
	);

	const { data, isLoading, isError } = useSessionsQuery({
		status: "public",
		limit: 20,
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		systemId: systemId ?? undefined,
		hasFreeSeats: hasFreeSeats || undefined,
		priceMin: isFree ? 0 : parseNumber(priceMin),
		priceMax: isFree ? 0 : parseNumber(priceMax),
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
		sort,
		order: sortOrder,
	});

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Сессии
			</h1>

			<div className="flex flex-col gap-4 mb-6">
				<Input
					placeholder="Поиск"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<div className="flex flex-wrap items-center gap-3">
					<Dropdown
						label="Формат"
						options={[...FORMAT_OPTIONS]}
						value={format}
						onChange={(v) => setFormat(v as SessionFormat | null)}
					/>
					<Dropdown
						label="Тип"
						options={[...TYPE_OPTIONS]}
						value={type}
						onChange={(v) => setType(v as SessionType | null)}
					/>
					<Dropdown
						label="Город"
						options={[]}
						value={null}
						onChange={() => {}}
						disabled
					/>
					<Dropdown
						label="Система"
						options={systemOptions}
						value={systemId}
						onChange={setSystemId}
					/>
					<FilterToggle
						label="Со свободными местами"
						isActive={hasFreeSeats}
						onChange={setHasFreeSeats}
					/>
					<FilterToggle
						label="Бесплатно"
						isActive={isFree}
						onChange={(v) => {
							setIsFree(v);
							if (v) {
								setPriceMin("");
								setPriceMax("");
							}
						}}
					/>

					<div className="ml-auto flex items-center gap-2">
						<ClearFiltersButton
							filters={{
								search,
								format,
								type,
								systemId,
								hasFreeSeats,
								isFree,
								priceMin,
								priceMax,
								dateFrom,
								dateTo,
							}}
							onClear={clearFilters}
							className="ml-auto"
						/>
						<Dropdown
							label="Сортировка"
							options={[...SORT_OPTIONS]}
							value={sort}
							onChange={(v) => {
								if (v !== null) setSort(v as SessionSortBy);
							}}
						/>
						<ToggleSortOrder
							sortOrder={sortOrder}
							onToggle={() =>
								setSortOrder((o) =>
									o === "asc" ? "desc" : "asc",
								)
							}
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
					<RangeField
						label="Цена"
						suffix="₽"
						type="number"
						from={priceMin}
						to={priceMax}
						onFromChange={setPriceMin}
						onToChange={setPriceMax}
						disabled={isFree}
					/>
					<RangeField
						label="Дата"
						type="date"
						from={dateFrom}
						to={dateTo}
						onFromChange={setDateFrom}
						onToChange={setDateTo}
					/>
				</div>
			</div>

			<SessionsList
				items={data?.items}
				users={data?.users}
				isLoading={isLoading}
				isError={isError}
				sort={sort}
				curated={curated}
			/>
		</div>
	);
}

function RangeField({
	label,
	suffix,
	type,
	from,
	to,
	onFromChange,
	onToChange,
	disabled,
}: {
	label: string;
	suffix?: string;
	type: "number" | "date";
	from: string;
	to: string;
	onFromChange: (v: string) => void;
	onToChange: (v: string) => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-base font-body uppercase text-(--text-muted)">
				{label}:
			</span>
			<Input
				csize="sm"
				type={type}
				placeholder="От"
				value={from}
				disabled={disabled}
				onChange={(e) => onFromChange(e.target.value)}
				className="w-32!"
			/>
			<Input
				csize="sm"
				type={type}
				placeholder="До"
				value={to}
				disabled={disabled}
				onChange={(e) => onToChange(e.target.value)}
				className="w-32!"
			/>
			{suffix && (
				<span className="text-base text-(--text-muted)">{suffix}</span>
			)}
		</div>
	);
}

export function SessionsList({
	items,
	users,
	isLoading,
	isError,
	sort,
	curated,
}: {
	items?: ISession[];
	users?: Record<string, IUserBrief>;
	isLoading: boolean;
	isError: boolean;
	sort: SessionSortBy;
	curated: ISystem[];
}) {
	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loading />
			</div>
		);
	}
	if (isError) {
		return (
			<p className="text-(--error) text-center py-12">Ошибка загрузки</p>
		);
	}
	if (!items || items.length === 0) {
		return (
			<p className="text-(--text-muted) text-center py-12 w-full">
				Сессий нет
			</p>
		);
	}

	const groupBy = getGroupBy(sort);
	if (!groupBy) {
		return (
			<div className="flex flex-wrap gap-4">
				{items.map((s) => (
					<SessionCard
						key={s.id}
						sessionData={s}
						master={users?.[s.masterId]}
					/>
				))}
			</div>
		);
	}

	const groups = groupSessions(items, groupBy);

	return (
		<div className="flex flex-col gap-6">
			{groups.map((g) => (
				<SessionGroup
					key={g.key}
					title={
						groupBy.kind === "date"
							? formatDateGroup(g.key)
							: renderSystemGroup(g.key, curated, g.items)
					}
					count={g.items.length}
				>
					{g.items.map((s) => (
						<SessionCard
							key={s.id}
							sessionData={s}
							master={users?.[s.masterId]}
						/>
					))}
				</SessionGroup>
			))}
		</div>
	);
}

type Group = { key: string; items: ISession[] };

function groupSessions(
	items: ISession[],
	groupBy: NonNullable<GroupBy>,
): Group[] {
	const order: string[] = [];
	const map = new Map<string, ISession[]>();
	for (const s of items) {
		const key =
			groupBy.kind === "date"
				? dateKey(s[groupBy.field] as string | undefined)
				: s.system.id;
		if (!map.has(key)) {
			map.set(key, []);
			order.push(key);
		}
		map.get(key)!.push(s);
	}
	return order.map((key) => ({ key, items: map.get(key)! }));
}

function dateKey(iso: string | undefined): string {
	if (!iso) return "no-date";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "no-date";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function formatDateGroup(key: string): string {
	if (key === "no-date") return "Без даты";
	const [y, m, d] = key.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	const day = date.getDate();
	const month = MONTHS_GENITIVE[date.getMonth()];
	const weekday = DAYS_OF_WEEK[date.getDay()];
	return `${day} ${month}, ${weekday}`;
}

function renderSystemGroup(
	systemId: string,
	curated: ISystem[],
	items: ISession[],
) {
	const system = items[0]?.system ?? curated.find((s) => s.id === systemId);
	if (!system) return systemId;
	return <SystemBadge system={system} />;
}

function parseNumber(s: string): number | undefined {
	if (s.trim() === "") return undefined;
	const n = Number(s);
	return isNaN(n) ? undefined : n;
}
