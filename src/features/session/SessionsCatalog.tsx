import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FORMAT_OPTIONS, TYPE_OPTIONS } from "../../utils/words";
import { SessionScope, SessionSortBy, StatusFilter } from "./api";
import { useCuratedSystemsQuery, useSessionsQuery } from "./queries";
import SessionGroup from "./SessionGroup";
import SystemSearch from "./SystemSearch";
import { parseEnum, useUrlSearch, useUrlState } from "../../hooks/useUrlState";
import { useInView } from "react-intersection-observer";

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

const DEFAULT_SORT = SessionSortBy.ScheduledAt;
const DEFAULT_ORDER = SortOrder.Asc;

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

export default function SessionsPage() {
	const { params: searchParams, patch: updateParams, clear } = useUrlState();

	const format = parseEnum(searchParams.get("format"), SessionFormat);
	const type = parseEnum(searchParams.get("type"), SessionType);
	const includedIds = useMemo(
		() => searchParams.getAll("systemIncluded"),
		[searchParams],
	);
	const excludedIds = useMemo(
		() => searchParams.getAll("systemExcluded"),
		[searchParams],
	);
	const priceMin = searchParams.get("priceMin") ?? "";
	const priceMax = searchParams.get("priceMax") ?? "";
	const dateFrom = searchParams.get("dateFrom") ?? "";
	const dateTo = searchParams.get("dateTo") ?? "";
	const freeSeats = searchParams.get("freeSeats") ?? "";
	const isFree = searchParams.get("isFree") === "1";
	const hasFreeSeats = searchParams.get("hasFreeSeats") === "1";

	const sort = parseEnum(
		searchParams.get("sort"),
		SessionSortBy,
		DEFAULT_SORT,
	);
	const sortOrder = parseEnum(
		searchParams.get("order"),
		SortOrder,
		DEFAULT_ORDER,
	);

	const {
		input: searchInput,
		setInput: setSearchInput,
		value: search,
	} = useUrlSearch("search");

	const { ref: scrollRef, inView } = useInView({ rootMargin: "300px 0px" });

	const { data: curated = [] } = useCuratedSystemsQuery();

	// Local cache of resolved ISystem objects (curated + ones the user added via
	// SystemSearch). Used purely for chip name lookup — the URL is the source of
	// truth for which IDs are filtered. Non-curated IDs loaded from a shared URL
	// will fall back to showing the raw id until backend supports id lookup.
	const [systemCache, setSystemCache] = useState<Map<string, ISystem>>(
		new Map(),
	);
	useEffect(() => {
		if (curated.length === 0) return;
		setSystemCache((prev) => {
			const next = new Map(prev);
			for (const s of curated) next.set(s.id, s);
			return next;
		});
	}, [curated]);

	const cacheSystem = useCallback((s: ISystem) => {
		setSystemCache((prev) => {
			if (prev.get(s.id) === s) return prev;
			return new Map(prev).set(s.id, s);
		});
	}, []);

	const addSystem = (s: ISystem) => {
		cacheSystem(s);
		updateParams({
			systemIncluded: includedIds.includes(s.id)
				? includedIds
				: [...includedIds, s.id],
			systemExcluded: excludedIds.filter((x) => x !== s.id),
		});
	};

	const excludeSystem = (s: ISystem) => {
		cacheSystem(s);
		updateParams({
			systemIncluded: includedIds.filter((x) => x !== s.id),
			systemExcluded: excludedIds.includes(s.id)
				? excludedIds
				: [...excludedIds, s.id],
		});
	};

	const removeSystem = (id: string) => {
		updateParams({
			systemIncluded: includedIds.filter((x) => x !== id),
			systemExcluded: excludedIds.filter((x) => x !== id),
		});
	};

	const clearFilters = () => clear(["sort", "order"]);

	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

	const chips = useMemo<ChipItem[]>(() => {
		const list: ChipItem[] = [];
		if (format) {
			list.push({
				key: "format",
				label: "Формат",
				value:
					FORMAT_OPTIONS.find((o) => o.value === format)?.label ??
					format,
				onRemove: () => updateParams({ format: null }),
			});
		}
		if (type) {
			list.push({
				key: "type",
				label: "Тип",
				value:
					TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type,
				onRemove: () => updateParams({ type: null }),
			});
		}
		for (const id of includedIds) {
			list.push({
				key: `sys-${id}`,
				label: "Система",
				value: systemCache.get(id)?.name ?? id,
				onRemove: () => removeSystem(id),
			});
		}
		for (const id of excludedIds) {
			list.push({
				key: `sys-${id}`,
				label: "Система",
				value: `не ${systemCache.get(id)?.name ?? id}`,
				variant: "danger",
				onRemove: () => removeSystem(id),
			});
		}
		if (priceMin || priceMax) {
			list.push({
				key: "price",
				label: "Цена",
				value: `${priceMin || "0"} – ${priceMax || "∞"} ₽`,
				onRemove: () =>
					updateParams({ priceMin: null, priceMax: null }),
			});
		}
		if (dateFrom || dateTo) {
			list.push({
				key: "date",
				label: "Дата",
				value: `${dateFrom || "…"} – ${dateTo || "…"}`,
				onRemove: () => updateParams({ dateFrom: null, dateTo: null }),
			});
		}
		if (freeSeats) {
			list.push({
				key: "seats",
				label: "Места",
				value: `${freeSeats}+`,
				onRemove: () => updateParams({ freeSeats: null }),
			});
		}
		return list;
		// `updateParams` and the system mutators are stable enough — derived from
		// `searchParams` via useCallback. Re-deriving chips on every searchParams
		// change is the intent.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		format,
		type,
		includedIds,
		excludedIds,
		systemCache,
		priceMin,
		priceMax,
		dateFrom,
		dateTo,
		freeSeats,
	]);

	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useSessionsQuery({
		scope: SessionScope.Catalog,
		status: StatusFilter.Public,
		limit: 3,
		search: search || undefined,
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

	const allItems = useMemo(
		() => data?.pages.flatMap((p) => p.items),
		[data?.pages],
	);
	const allUsers = useMemo(
		() =>
			data?.pages.reduce<Record<string, IUserBrief>>(
				(acc, p) => Object.assign(acc, p.users),
				{},
			),
		[data?.pages],
	);

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Сессии
			</h1>

			<div className="flex flex-col gap-4 mb-6">
				<div className="flex gap-3 items-center">
					<Input
						placeholder="Поиск"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<Dropdown
						label=""
						labelIcon="sort"
						options={[...SORT_OPTIONS]}
						value={sort}
						onChange={(v) => {
							if (v === null) return;
							const next = v as SessionSortBy;
							updateParams({
								sort: next === DEFAULT_SORT ? null : next,
							});
						}}
						className="shrink-0"
					/>
					<ToggleSortOrder
						sortOrder={sortOrder}
						onToggle={() => {
							const next =
								sortOrder === SortOrder.Asc
									? SortOrder.Desc
									: SortOrder.Asc;
							updateParams({
								order: next === DEFAULT_ORDER ? null : next,
							});
						}}
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
							onChange={() =>
								updateParams({
									hasFreeSeats: !hasFreeSeats ? "1" : null,
									freeSeats: null,
								})
							}
						/>
						<FilterToggle
							label="Бесплатно"
							isActive={isFree}
							onChange={(v) =>
								updateParams({
									isFree: v ? "1" : null,
									...(v
										? { priceMin: null, priceMax: null }
										: {}),
								})
							}
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
							systems: [...includedIds, ...excludedIds],
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
						onChange={(v) =>
							updateParams({
								format: (v as SessionFormat | null) ?? null,
							})
						}
						fullWidth
					/>
				</FilterSection>
				<FilterSection label="Тип">
					<Dropdown
						label=""
						options={[...TYPE_OPTIONS]}
						value={type}
						onChange={(v) =>
							updateParams({
								type: (v as SessionType | null) ?? null,
							})
						}
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
						onAdd={addSystem}
						onExclude={excludeSystem}
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
						onFromChange={(v) => updateParams({ priceMin: v })}
						onToChange={(v) => updateParams({ priceMax: v })}
						disabled={isFree}
					/>
				</FilterSection>
				<FilterSection label="Дата">
					<RangeField
						label=""
						type="date"
						from={dateFrom}
						to={dateTo}
						onFromChange={(v) => updateParams({ dateFrom: v })}
						onToChange={(v) => updateParams({ dateTo: v })}
					/>
				</FilterSection>
				<FilterSection label="Свободные места">
					<Input
						type="number"
						step={1}
						min={0}
						max={50}
						csize="sm"
						value={freeSeats}
						onChange={(e) =>
							updateParams({ freeSeats: e.target.value || null })
						}
					></Input>
				</FilterSection>
			</FilterModal>

			<SessionsList
				items={allItems}
				users={allUsers}
				isLoading={isLoading}
				isError={isError}
				sort={sort}
				curated={curated}
			/>
			<div ref={scrollRef} className="h-1" />
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
