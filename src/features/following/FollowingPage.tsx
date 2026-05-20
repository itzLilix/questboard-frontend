import { useEffect, useState } from "react";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/FilterToggle";
import Input from "../../components/ui/inputs/Input";
import type { SessionFormat, SessionType } from "../../types/session";
import { useFollowingQuery } from "./queries";
import type { SortBy, SortOrder } from "../usersCatalog/api";
import { UsersList } from "../usersCatalog/GMsPage";
import type { userCardProps } from "../../components/ui/cards/UserCard";
import ClearFiltersButton from "../../components/ui/ClearFiltersButton";
import ToggleSortOrder from "../../components/ui/ToggleSortOrder";
import ToggleView from "../../components/ui/ToggleView";

const FORMAT_OPTIONS = [
	{ value: "online", label: "Онлайн" },
	{ value: "offline", label: "Оффлайн" },
];

const TYPE_OPTIONS = [
	{ value: "oneshot", label: "Ваншот" },
	{ value: "campaign", label: "Кампания" },
];

const SORT_OPTIONS = [
	{ value: "rating", label: "Рейтинг" },
	{ value: "followedAt", label: "Дата подписки" },
	{ value: "reviews", label: "Отзывы" },
	{ value: "recent", label: "Регистрация" },
	{ value: "sessions", label: "Игры" },
] as const satisfies readonly { value: string; label: string }[];

export default function FollowingPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [format, setFormat] = useState<SessionFormat | null>(null);
	const [type, setType] = useState<SessionType | null>(null);
	const [highRating, setHighRating] = useState(false);
	const [sort, setSort] = useState<SortBy | null>("followedAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [view, setView] = useState<userCardProps["view"]>("table");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	const { data, isLoading, isError } = useFollowingQuery({
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		minRating: highRating ? 4.5 : undefined,
		followedBy: "me",
		sort: sort ?? undefined,
		order: sortOrder,
	});

	const clearFilters = () => {
		setSearch("");
		setFormat(null);
		setType(null);
		setHighRating(false);
	};

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Подписки
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
						options={FORMAT_OPTIONS}
						value={format}
						onChange={(v) => setFormat(v as SessionFormat | null)}
					/>
					<Dropdown
						label="Тип"
						options={TYPE_OPTIONS}
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
						<ToggleView view={view} setView={setView} />
						<Dropdown
							label="Сортировка"
							options={[...SORT_OPTIONS]}
							value={sort}
							onChange={(v) => {
								if (v !== null) setSort(v as SortBy);
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
