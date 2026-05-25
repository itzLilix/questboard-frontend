import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ActiveFilterChips, {
	type ChipItem,
} from "../../components/ui/filters/ActiveFilterChips";
import ClearFiltersButton from "../../components/ui/filters/ClearFiltersButton";
import Dropdown from "../../components/ui/Dropdown";
import FilterButton from "../../components/ui/filters/FilterButton";
import FilterModal, {
	FilterSection,
} from "../../components/ui/filters/FilterModal";
import RangeField from "../../components/ui/filters/FilterRange";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import Input from "../../components/ui/inputs/Input";
import Loading from "../../components/ui/Loading";
import SessionCard from "../../components/ui/cards/SessionCard";
import { SystemBadge } from "../../components/ui/SystemBadge";
import ToggleSortOrder from "../../components/ui/filters/ToggleSortOrder";
import { SessionFormat, SessionType, type ISession } from "../../types/session";
import { SortOrder } from "../../types/query";
import type { ISystem, IUserBrief } from "../../types/userCard";
import { dateKey, formatDateWeekday } from "../../utils/dateFormats";
import { type Option, options } from "../../utils/options";
import {
	FORMAT_OPTIONS,
	MultiSelectState,
	TYPE_OPTIONS,
} from "../../utils/words";
import { SessionSortBy, StatusFilter } from "./api";
import { useCuratedSystemsQuery, useSessionsQuery } from "./queries";
import SessionGroup from "./SessionGroup";
import SystemSearch from "./SystemSearch";

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
	const [systems, setSystems] = useState<Map<ISystem, MultiSelectState>>(
		new Map(),
	);
	const [freeSeats, setFreeSeats] = useState("");
	const [isFree, setIsFree] = useState(false);
	const [hasFreeSeats, setHasFreeSeats] = useState(false);
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
		setSystems(new Map());
		setFreeSeats("");
		setIsFree(false);
		setPriceMin("");
		setPriceMax("");
		setDateFrom("");
		setDateTo("");
	};

	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

	const { data: curated = [] } = useCuratedSystemsQuery();

	const systemInitialized = useRef(false);
	useEffect(() => {
		if (systemInitialized.current || curated.length === 0) return;
		const id = searchParams.get("systemIncluded");
		if (!id) {
			systemInitialized.current = true;
			return;
		}
		const system = curated.find((s) => s.id === id);
		if (system) setSystems(new Map([[system, MultiSelectState.Included]]));
		systemInitialized.current = true;
	}, [curated]);

	const [includedIds, excludedIds] = useMemo(
		() =>
			[...systems].reduce<[string[], string[]]>(
				([inc, exc], [gs, state]) =>
					state === MultiSelectState.Included
						? [[...inc, gs.id], exc]
						: [inc, [...exc, gs.id]],
				[[], []],
			),
		[systems],
	);

	const chips = useMemo<ChipItem[]>(() => {
		const list: ChipItem[] = [];
		if (format) {
			list.push({
				key: "format",
				label: "Формат",
				value:
					FORMAT_OPTIONS.find((o) => o.value === format)?.label ??
					format,
				onRemove: () => setFormat(null),
			});
		}
		if (type) {
			list.push({
				key: "type",
				label: "Тип",
				value:
					TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type,
				onRemove: () => setType(null),
			});
		}
		for (const [gs, state] of systems) {
			list.push({
				key: `sys-${gs.id}`,
				label: "Система",
				value:
					state === MultiSelectState.Excluded
						? `не ${gs.name}`
						: gs.name,
				variant:
					state === MultiSelectState.Excluded ? "danger" : "default",
				onRemove: () =>
					setSystems((prev) => {
						const next = new Map(prev);
						next.delete(gs);
						return next;
					}),
			});
		}
		if (priceMin || priceMax) {
			const value = `${priceMin || "0"} – ${priceMax || "∞"} ₽`;
			list.push({
				key: "price",
				label: "Цена",
				value,
				onRemove: () => {
					setPriceMin("");
					setPriceMax("");
				},
			});
		}
		if (dateFrom || dateTo) {
			const value = `${dateFrom || "…"} – ${dateTo || "…"}`;
			list.push({
				key: "date",
				label: "Дата",
				value,
				onRemove: () => {
					setDateFrom("");
					setDateTo("");
				},
			});
		}
		if (freeSeats) {
			const value = `${freeSeats}+`;
			list.push({
				key: "seats",
				label: "Места",
				value,
				onRemove: () => {
					setFreeSeats("");
				},
			});
		}
		return list;
	}, [
		format,
		type,
		systems,
		curated,
		priceMin,
		priceMax,
		dateFrom,
		dateTo,
		freeSeats,
	]);

	const { data, isLoading, isError } = useSessionsQuery({
		status: StatusFilter.Public,
		limit: 20,
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		systemIncluded: includedIds.length > 0 ? includedIds : undefined,
		systemExcluded: excludedIds.length > 0 ? excludedIds : undefined,
		freeSeats: hasFreeSeats ? 1 : parseInt(freeSeats) || undefined,
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
				<div className="flex gap-3 items-center">
					<Input
						placeholder="Поиск"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Dropdown
						label=""
						labelIcon="sort"
						options={[...SORT_OPTIONS]}
						value={sort}
						onChange={(v) => {
							if (v !== null) setSort(v as SessionSortBy);
						}}
						className="shrink-0"
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

				<div className="flex items-start gap-3">
					<div className="flex flex-wrap gap-3">
						<FilterButton
							onClick={() => setIsFilterModalOpen(true)}
							count={chips.length}
						/>
						<FilterToggle
							label="Есть места"
							isActive={hasFreeSeats}
							onChange={() => {
								setHasFreeSeats(!hasFreeSeats);
								setFreeSeats("");
							}}
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

						<ActiveFilterChips
							chips={chips}
							className="self-center"
						/>
					</div>

					<ClearFiltersButton
						filters={{
							search,
							format,
							type,
							systems: [...systems.keys()],
							hasFreeSeats,
							freeSeats,
							isFree,
							priceMin,
							priceMax,
							dateFrom,
							dateTo,
						}}
						onClear={clearFilters}
						className="ml-auto"
					/>
				</div>
			</div>

			<FilterModal
				isOpen={isFilterModalOpen}
				onClose={() => setIsFilterModalOpen(false)}
			>
				<FilterSection label="Формат">
					<Dropdown
						label=""
						options={[...FORMAT_OPTIONS]}
						value={format}
						onChange={(v) => setFormat(v as SessionFormat | null)}
						fullWidth
					/>
				</FilterSection>
				<FilterSection label="Тип">
					<Dropdown
						label=""
						options={[...TYPE_OPTIONS]}
						value={type}
						onChange={(v) => setType(v as SessionType | null)}
						fullWidth
					/>
				</FilterSection>
				<FilterSection label="Город">
					<Dropdown
						label=""
						options={[]}
						value={null}
						onChange={() => {}}
						disabled
						fullWidth
					/>
				</FilterSection>
				<FilterSection label="Система">
					<SystemSearch
						multiple
						onAdd={(s) =>
							setSystems((prev) =>
								new Map(prev).set(s, MultiSelectState.Included),
							)
						}
						onExclude={(s) =>
							setSystems((prev) =>
								new Map(prev).set(s, MultiSelectState.Excluded),
							)
						}
					/>
					<ActiveFilterChips
						chips={chips.filter((c) => c.key.startsWith("sys-", 0))}
						className="mt-3"
					/>
				</FilterSection>
				<FilterSection label="Цена">
					<RangeField
						label=""
						suffix="₽"
						type="number"
						from={priceMin}
						to={priceMax}
						onFromChange={setPriceMin}
						onToChange={setPriceMax}
						disabled={isFree}
					/>
				</FilterSection>
				<FilterSection label="Дата">
					<RangeField
						label=""
						type="date"
						from={dateFrom}
						to={dateTo}
						onFromChange={setDateFrom}
						onToChange={setDateTo}
					/>
				</FilterSection>
				<FilterSection label="Свободные места">
					<Input
						type="number"
						step={1}
						min={0}
						max={50}
						csize="sm"
						onChange={(e) => setFreeSeats(e.target.value)}
					></Input>
				</FilterSection>
			</FilterModal>

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
			<div className="grid grid-cols-5 gap-4">
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
