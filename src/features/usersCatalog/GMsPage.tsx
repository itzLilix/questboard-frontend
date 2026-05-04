import clsx from "clsx";
import Input from "../../components/ui/Input";
import { useState, useEffect } from "react";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/FilterToggle";
import Icon from "../../components/ui/Icon";
import Loading from "../../components/ui/Loading";
import UserCard, { type userCardProps } from "../../components/ui/UserCard";
import type { SessionFormat, SessionType } from "../../types/session";
import type { IUserCard } from "../../types/userCard";
import type { SortBy, SortOrder, UsersListResponse } from "../usersCatalog/api";
import { useUsersCatalogQuery } from "./queries";

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
	{ value: "reviews", label: "Отзывы" },
	{ value: "recent", label: "Регистрация" },
	{ value: "sessions", label: "Игры" },
];

export default function GMsPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [format, setFormat] = useState<SessionFormat | null>(null);
	const [type, setType] = useState<SessionType | null>(null);
	const [highRating, setHighRating] = useState(false);
	const [sort, setSort] = useState<SortBy | null>("rating");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [view, setView] = useState<userCardProps["view"]>("table");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(t);
	}, [search]);

	const { data, isLoading, isError } = useUsersCatalogQuery({
		search: debouncedSearch || undefined,
		format: format ?? undefined,
		type: type ?? undefined,
		minRating: highRating ? 4.5 : undefined,
		onlyGMs: true,
		sort: sort ?? undefined,
		order: sortOrder,
	});

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Список мастеров
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
						<FilterToggle
							isActive={false}
							onChange={() =>
								setView(view === "table" ? "card" : "table")
							}
						>
							<Icon
								name={
									view === "table"
										? "view_agenda"
										: "grid_view"
								}
								className="text-lg! leading-none!"
							/>
						</FilterToggle>
						<Dropdown
							label="Сортировка"
							options={SORT_OPTIONS}
							value={sort}
							onChange={(v) => {
								if (v !== null) setSort(v as SortBy);
							}}
						/>
						<button
							type="button"
							title={
								sortOrder === "asc"
									? "По возрастанию"
									: "По убыванию"
							}
							className={clsx(
								"inline-flex items-center justify-center h-10 w-10 rounded-xl border border-(--border) bg-(--bg-surface)",
								"cursor-pointer transition-colors duration-200 hover:bg-(--bg-elevated)",
								"focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)",
								"focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base)",
							)}
							onClick={() =>
								setSortOrder((o) =>
									o === "asc" ? "desc" : "asc",
								)
							}
						>
							<Icon
								name={
									sortOrder === "asc"
										? "arrow_upward"
										: "arrow_downward"
								}
								className="text-lg! leading-none! text-(--text-muted)!"
							/>
						</button>
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
				<UserCard profileData={user as IUserCard} view={view} />
			))}
		</div>
	);
}
