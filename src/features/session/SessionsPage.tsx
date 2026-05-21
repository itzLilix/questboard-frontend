import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClearFiltersButton from "../../components/ui/ClearFiltersButton";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/FilterToggle";
import Input from "../../components/ui/inputs/Input";
import Loading from "../../components/ui/Loading";
import SessionCard from "../../components/ui/cards/SessionCard";
import { SystemBadge } from "../../components/ui/SystemBadge";
import {
	SessionFormat,
	SessionType,
	type ISession,
} from "../../types/session";
import type { ISystem, IUserBrief } from "../../types/userCard";
import { type Option, options } from "../../utils/options";
import { useCuratedSystemsQuery, useSessionsQuery } from "./queries";
import { SessionSortBy, StatusFilter } from "./api";
import { SortOrder } from "../../types/query";
import SessionGroup from "./SessionGroup";
import ToggleSortOrder from "../../components/ui/ToggleSortOrder";
import RangeField from "../../components/ui/FilterRange";
import { dateKey, formatDateWeekday } from "../../utils/dateFormats";

const FORMAT_OPTIONS = options([
	{ value: SessionFormat.Online, label: "Онлайн" },
	{ value: SessionFormat.Offline, label: "Оффлайн" },
]) satisfies readonly Option<SessionFormat>[];

const TYPE_OPTIONS = options([
	{ value: SessionType.Oneshot, label: "Ваншот" },
	{ value: SessionType.Campaign, label: "Кампания" },
]) satisfies readonly Option<SessionType>[];

const SORT_OPTIONS = options([
	{ value: SessionSortBy.ScheduledAt, label: "Дата проведения" },
	{ value: SessionSortBy.CreatedAt, label: "Дата создания" },
	{ value: SessionSortBy.System, label: "Система" },
	{ value: SessionSortBy.Price, label: "Цена" },
	{ value: SessionSortBy.Title, label: "Название" },
]) satisfies readonly Option<SessionSortBy>[];

const DATE_FIELD_BY_SORT = {
	[SessionSortBy.ScheduledAt]: "scheduledAt",
	[SessionSortBy.CreatedAt]: "createdAt",
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
	if (sort === SessionSortBy.System) return { kind: "system" };
	return null;
}

function parseFormat(v: string | null): SessionFormat | null {
	return v === SessionFormat.Online || v === SessionFormat.Offline ? v : null;
}

function parseType(v: string | null): SessionType | null {
	return v === SessionType.Oneshot || v === SessionType.Campaign ? v : null;
}

export default function SessionsPage() {
	const [searchParams] = useSearchParams();

	const [search, setSearch] = useState(
		() => searchParams.get("search") ?? "",
	);
	const [debouncedSearch, setDebouncedSearch] = useState(
		() => searchParams.get("search") ?? "",
	);
	const [format, setFormat] = useState<SessionFormat | null>(() =>
		parseFormat(searchParams.get("format")),
	);
	const [type, setType] = useState<SessionType | null>(() =>
		parseType(searchParams.get("type")),
	);
	const [systemId, setSystemId] = useState<string | null>(() =>
		searchParams.get("systemId"),
	);
	const [hasFreeSeats, setHasFreeSeats] = useState(false);
	const [isFree, setIsFree] = useState(false);
	const [priceMin, setPriceMin] = useState(
		() => searchParams.get("priceMin") ?? "",
	);
	const [priceMax, setPriceMax] = useState(
		() => searchParams.get("priceMax") ?? "",
	);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState<SessionSortBy>(SessionSortBy.ScheduledAt);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

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
		status: StatusFilter.Public,
		limit: 20,
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		systemId: systemId ?? undefined,
		hasFreeSeats: hasFreeSeats || undefined,
		priceMin: isFree ? 0 : parseInt(priceMin, 10) || undefined,
		priceMax: isFree ? 0 : parseInt(priceMax, 10) || undefined,
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
						label="Есть места"
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
									o === SortOrder.Asc
										? SortOrder.Desc
										: SortOrder.Asc,
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

	function renderSystemGroup(
		systemId: string,
		curated: ISystem[],
		items: ISession[],
	) {
		const system =
			items[0]?.system ?? curated.find((s) => s.id === systemId);
		if (!system) return systemId;
		return <SystemBadge system={system} />;
	}

	return (
		<div className="flex flex-col gap-6">
			{groups.map((g) => (
				<SessionGroup
					key={g.key}
					title={
						groupBy.kind === "date"
							? formatDateWeekday(g.key)
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
