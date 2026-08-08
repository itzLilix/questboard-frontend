import Input from "../../components/ui/inputs/Input";
import { useEffect, useMemo, useState } from "react";
import ClearFiltersButton from "../../components/ui/filters/ClearFiltersButton";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import ListLoading from "../../components/ui/ListLoading";
import EmptyState from "../../components/ui/EmptyState";
import UserCard, {
	type userCardProps,
} from "../../components/ui/cards/UserCard";
import { SessionFormat, SessionType } from "../../types/session";
import { type Option, options } from "../../utils/options";
import { UserSortBy } from "../usersCatalog/api";
import { SortOrder } from "../../types/query";
import type { IUserCard } from "../../types/userCard";
import { useUsersCatalogQuery } from "./queries";
import ToggleSortOrder from "../../components/ui/filters/ToggleSortOrder";
import ToggleView from "../../components/ui/ToggleView";
import { FORMAT_OPTIONS, TYPE_OPTIONS } from "../../utils/words";
import { parseEnum, useUrlSearch, useUrlState } from "../../hooks/useUrlState";
import { useInView } from "react-intersection-observer";
import useAuth from "../auth/AuthProvider";

const SORT_OPTIONS = options([
	{ value: UserSortBy.Rating, label: "Рейтинг" },
	{ value: UserSortBy.Reviews, label: "Отзывы" },
	{ value: UserSortBy.Recent, label: "Регистрация" },
	{ value: UserSortBy.Sessions, label: "Игры" },
]) satisfies readonly Option<UserSortBy>[];

const DEFAULT_SORT = UserSortBy.Rating;
const DEFAULT_ORDER = SortOrder.Desc;

export default function GMsPage() {
	const { params: searchParams, patch: updateParams, clear } = useUrlState();
	const { user } = useAuth();

	const format = parseEnum(searchParams.get("format"), SessionFormat);
	const type = parseEnum(searchParams.get("type"), SessionType);
	const highRating = searchParams.get("highRating") === "1";

	const sort = parseEnum(searchParams.get("sort"), UserSortBy, DEFAULT_SORT);
	const sortOrder = parseEnum(
		searchParams.get("order"),
		SortOrder,
		DEFAULT_ORDER,
	);

	const [view, setView] = useState<userCardProps["view"]>("table");

	const {
		input: searchInput,
		setInput: setSearchInput,
		value: search,
	} = useUrlSearch("search");

	const clearFilters = () => clear(["sort", "order"]);

	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useUsersCatalogQuery({
		search: search || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		minRating: highRating ? 4.5 : undefined,
		onlyGMs: true,
		sort: sort ?? undefined,
		order: sortOrder,
	});

	const { ref: scrollRef, inView } = useInView({ rootMargin: "300px 0px" });
	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allItems = useMemo(
		() =>
			data?.pages
				.flatMap((p) => p.items)
				.filter((u) => !user || u.id !== user.id),
		[data?.pages, user],
	);

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Список мастеров
			</h1>

			<div className="flex flex-col gap-4 mb-6">
				<div className="flex gap-3 items-center">
					<Input
						placeholder="Поиск"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<ToggleView view={view} setView={setView} />
					<Dropdown
						label=""
						labelIcon="sort"
						options={[...SORT_OPTIONS]}
						value={sort}
						onChange={(v) => {
							if (v === null) return;
							const next = v as UserSortBy;
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
				<div className="flex flex-wrap items-center gap-3">
					<Dropdown
						label="Формат"
						options={[...FORMAT_OPTIONS]}
						value={format}
						onChange={(v) =>
							updateParams({
								format: (v as SessionFormat | null) ?? null,
							})
						}
					/>
					<Dropdown
						label="Тип"
						options={[...TYPE_OPTIONS]}
						value={type}
						onChange={(v) =>
							updateParams({
								type: (v as SessionType | null) ?? null,
							})
						}
					/>
					<Dropdown
						label="Город"
						options={[]}
						value={null}
						onChange={() => {}}
						disabled
					/>
					<FilterToggle
						label="Рейтинг 4,5+"
						isActive={highRating}
						onChange={(v) => {
							updateParams({
								highRating: v ? "1" : null,
							});
						}}
					/>

					<div className="ml-auto flex items-center gap-2">
						<ClearFiltersButton
							filters={{ search, format, type, highRating }}
							onClear={clearFilters}
						/>
					</div>
				</div>
			</div>

			<UsersList
				isError={isError}
				isLoading={isLoading}
				items={allItems}
				view={view}
			/>
			<div ref={scrollRef} className="h-1" />
		</div>
	);
}

export type UsersListProps = {
	isLoading: boolean;
	isError: boolean;
	items?: IUserCard[];
	view: userCardProps["view"];
};
export function UsersList({ isLoading, isError, items, view }: UsersListProps) {
	if (isLoading) return <ListLoading />;
	if (isError) {
		return (
			<p className="text-(--error) text-center py-12">Ошибка загрузки</p>
		);
	}
	if (!items || items.length === 0) return <EmptyState text="Никого нет" />;
	return (
		<div
			className={
				view === "card"
					? "flex flex-wrap gap-4"
					: `grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center`
			}
		>
			{items.map((user) => (
				<UserCard key={user.id} profileData={user} view={view} />
			))}
		</div>
	);
}
