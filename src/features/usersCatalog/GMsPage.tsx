import Input from "../../components/ui/inputs/Input";
import { useState, useEffect } from "react";
import ClearFiltersButton from "../../components/ui/filters/ClearFiltersButton";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import Loading from "../../components/ui/Loading";
import UserCard, {
	type userCardProps,
} from "../../components/ui/cards/UserCard";
import { SessionFormat, SessionType } from "../../types/session";
import { type Option, options } from "../../utils/options";
import { UserSortBy, type UsersListResponse } from "../usersCatalog/api";
import { SortOrder } from "../../types/query";
import { useUsersCatalogQuery } from "./queries";
import ToggleSortOrder from "../../components/ui/filters/ToggleSortOrder";
import ToggleView from "../../components/ui/ToggleView";
import { FORMAT_OPTIONS, TYPE_OPTIONS } from "../../utils/words";
import useAuth from "../../hooks/useAuth";

const SORT_OPTIONS = options([
	{ value: UserSortBy.Rating, label: "Рейтинг" },
	{ value: UserSortBy.Reviews, label: "Отзывы" },
	{ value: UserSortBy.Recent, label: "Регистрация" },
	{ value: UserSortBy.Sessions, label: "Игры" },
]) satisfies readonly Option<UserSortBy>[];

export default function GMsPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [format, setFormat] = useState<SessionFormat | null>(null);
	const [type, setType] = useState<SessionType | null>(null);
	const [highRating, setHighRating] = useState(false);
	const [sort, setSort] = useState<UserSortBy | null>(UserSortBy.Rating);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Desc);
	const [view, setView] = useState<userCardProps["view"]>("table");
	const { user } = useAuth();

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	const clearFilters = () => {
		setSearch("");
		setFormat(null);
		setType(null);
		setHighRating(false);
	};

	const {
		data: rawData,
		isLoading,
		isError,
	} = useUsersCatalogQuery({
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		minRating: highRating ? 4.5 : undefined,
		onlyGMs: true,
		sort: sort ?? undefined,
		order: sortOrder,
	});

	const data =
		rawData && user
			? {
					...rawData,
					items: rawData.items.filter((u) => u.id !== user.id),
				}
			: rawData;

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Список мастеров
			</h1>

			<div className="flex flex-col gap-4 mb-6">
				<div className="flex gap-3 items-center">
					<Input
						placeholder="Поиск"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<ToggleView view={view} setView={setView} />
					<Dropdown
						label=""
						labelIcon="sort"
						options={[...SORT_OPTIONS]}
						value={sort}
						onChange={(v) => {
							if (v !== null) setSort(v as UserSortBy);
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
					<FilterToggle
						label="Рейтинг 4,5+"
						isActive={highRating}
						onChange={setHighRating}
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
				data={data}
				view={view}
			/>
		</div>
	);
}

export type UsersListProps = {
	isLoading: boolean;
	isError: boolean;
	data: UsersListResponse | undefined;
	view: userCardProps["view"];
};
export function UsersList({ isLoading, isError, data, view }: UsersListProps) {
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
	if (data === undefined || data.items.length === 0)
		return (
			<p className="text-(--text-muted) text-center py-12 w-full">
				Никого нет
			</p>
		);
	return (
		<div
			className={
				view === "card"
					? "flex flex-wrap gap-4"
					: `grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center`
			}
		>
			{data.items.map((user) => (
				<UserCard key={user.id} profileData={user} view={view} />
			))}
		</div>
	);
}
