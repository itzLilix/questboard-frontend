import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCuratedSystemsQuery, useSessionsQuery } from "../session/queries";
import { useUsersCatalogQuery } from "../usersCatalog/queries";
import { SessionFormat, SessionType } from "../../types/session";
import { SessionSortBy, StatusFilter } from "../session/api";
import { UserSortBy } from "../usersCatalog/api";
import { SortOrder } from "../../types/query";
import Button from "../../components/ui/Button";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/inputs/Input";
import Loading from "../../components/ui/Loading";
import OrDivider from "../../components/ui/OrDivider";
import SessionCard from "../../components/ui/cards/SessionCard";
import UserCard from "../../components/ui/cards/UserCard";
import { TYPE_OPTIONS } from "../../utils/words";

function Label({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 min-w-0">
			<span className="font-body text-base uppercase tracking-wider text-(--text-muted)">
				{label}
			</span>
			{children}
		</div>
	);
}

function HeroStat({
	value,
	label,
	withDivider,
}: {
	value: string;
	label: string;
	withDivider?: boolean;
}) {
	return (
		<div
			className={`flex flex-col px-6 first:pl-0 last:pr-0 ${
				withDivider ? "border-r border-(--border)" : ""
			}`}
		>
			<span className="font-display text-3xl text-(--text-primary)">
				{value}
			</span>
			<span className="font-body text-sm uppercase tracking-wider text-(--text-muted)">
				{label}
			</span>
		</div>
	);
}

function FormatFilter({
	value,
	onChange,
}: {
	value: SessionFormat | null;
	onChange: (v: SessionFormat | null) => void;
}) {
	return (
		<Label label="Формат">
			<div className="flex gap-3">
				<FilterToggle
					isActive={value === null}
					onChange={() => onChange(null)}
					className="flex-1"
				>
					Все
				</FilterToggle>
				<FilterToggle
					isActive={value === SessionFormat.Online}
					onChange={() => onChange(SessionFormat.Online)}
					className="flex-1"
				>
					Онлайн
				</FilterToggle>
				<FilterToggle
					isActive={value === SessionFormat.Offline}
					onChange={() => onChange(SessionFormat.Offline)}
					className="flex-1"
				>
					Оффлайн
				</FilterToggle>
			</div>
		</Label>
	);
}

function PriceRange({
	from,
	to,
	onFromChange,
	onToChange,
}: {
	from: string;
	to: string;
	onFromChange: (v: string) => void;
	onToChange: (v: string) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<Input
				type="number"
				placeholder="от"
				value={from}
				onChange={(e) => onFromChange(e.target.value)}
				className="h-12!"
			/>
			<span className="font-body text-base text-(--text-muted)">—</span>
			<Input
				type="number"
				placeholder="до"
				value={to}
				onChange={(e) => onToChange(e.target.value)}
				className="h-12!"
			/>
			<span className="font-body text-base text-(--text-muted)">₽</span>
		</div>
	);
}

function SearchCard() {
	const navigate = useNavigate();
	const [format, setFormat] = useState<SessionFormat | null>(null);
	const [type, setType] = useState<SessionType | null>(null);
	const [systemId, setSystemId] = useState<string | null>(null);
	const [priceMin, setPriceMin] = useState("");
	const [priceMax, setPriceMax] = useState("");

	const { data: curated = [] } = useCuratedSystemsQuery();
	const systemOptions = curated.map((s) => ({ value: s.id, label: s.name }));

	const handleSearch = () => {
		const params = new URLSearchParams();
		if (format) params.set("format", format);
		if (type) params.set("type", type);
		if (systemId) params.set("systemIncluded", systemId);
		if (priceMin) params.set("priceMin", priceMin);
		if (priceMax) params.set("priceMax", priceMax);
		const query = params.toString();
		navigate(query ? `/sessions?${query}` : "/sessions");
	};

	return (
		<div className="w-full max-w-150 flex flex-col gap-6 rounded-2xl border border-(--border) bg-(--bg-card) px-6 pt-8 pb-12">
			<h2 className="font-display text-2xl text-(--text-primary) text-center">
				Найти сессию
			</h2>

			<FormatFilter value={format} onChange={setFormat} />

			<div className="grid grid-cols-2 grid-rows-1 gap-4 relative">
				<Label label="Система">
					<Dropdown
						label=""
						options={systemOptions}
						value={systemId}
						onChange={setSystemId}
						fullWidth
					/>
				</Label>
				<Label label="Тип">
					<Dropdown
						label=""
						options={[...TYPE_OPTIONS]}
						value={type}
						onChange={(v) => setType(v as SessionType | null)}
						fullWidth
					/>
				</Label>
			</div>

			<div className="grid grid-cols-2 grid-rows-1 gap-4">
				<Label label="Город">
					<Dropdown
						label=""
						options={[]}
						value={null}
						onChange={() => {}}
						fullWidth
						disabled
					/>
				</Label>
				<Label label="Цена">
					<PriceRange
						from={priceMin}
						to={priceMax}
						onFromChange={setPriceMin}
						onToChange={setPriceMax}
					/>
				</Label>
			</div>

			<Button
				variant="primary"
				csize="md"
				fullWidth
				onClick={handleSearch}
			>
				Показать игры
			</Button>

			<OrDivider />

			<Button
				variant="secondary"
				csize="md"
				fullWidth
				onClick={() => navigate("/sessions/new")}
			>
				Создать свою
			</Button>
		</div>
	);
}

function ViewAllCard({
	to,
	label,
	className,
}: {
	to: string;
	label: string;
	className?: string;
}) {
	return (
		<Link
			to={to}
			className={`bg-(--bg-card) border border-dashed border-(--border) rounded-2xl flex flex-col items-center justify-center gap-2 text-(--text-secondary) hover:text-(--accent) hover:border-(--accent) transition-colors ${className || ""}`}
		>
			<Icon name="arrow_forward" className="text-3xl!" />
			<span className="font-body text-base">{label}</span>
		</Link>
	);
}

function RowSection({
	title,
	to,
	isLoading,
	isEmpty,
	children,
}: {
	title: string;
	to: string;
	isLoading: boolean;
	isEmpty: boolean;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4 mt-16">
			<div className="flex items-baseline justify-between">
				<h2 className="font-display text-3xl text-(--text-primary)">
					{title}
				</h2>
				<Link
					to={to}
					className="font-body text-base text-(--text-secondary) hover:text-(--accent) transition-colors"
				>
					Все →
				</Link>
			</div>
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loading />
				</div>
			) : isEmpty ? (
				<p className="text-(--text-muted) text-center py-12">
					Пока пусто
				</p>
			) : (
				<div className="flex flex-wrap gap-4">{children}</div>
			)}
		</section>
	);
}

function ClosestSessionsRow() {
	const { data, isLoading } = useSessionsQuery({
		status: StatusFilter.Public,
		sort: SessionSortBy.ScheduledAt,
		order: SortOrder.Asc,
		limit: 4,
	});
	const items = data?.items ?? [];

	return (
		<RowSection
			title="Ближайшие сессии"
			to="/sessions"
			isLoading={isLoading}
			isEmpty={items.length === 0}
		>
			{items.map((s) => (
				<SessionCard
					key={s.id}
					sessionData={s}
					master={data?.users?.[s.masterId]}
				/>
			))}
			<ViewAllCard
				to="/sessions"
				label="Все сессии"
				className="aspect-9/12 min-w-2xs"
			/>
		</RowSection>
	);
}

function TopGMsRow() {
	const { data, isLoading } = useUsersCatalogQuery({
		onlyGMs: true,
		sort: UserSortBy.Rating,
		order: SortOrder.Desc,
		limit: 5,
	});
	const items = data?.items ?? [];

	return (
		<RowSection
			title="Лучшие мастера"
			to="/game-masters"
			isLoading={isLoading}
			isEmpty={items.length === 0}
		>
			{items.map((u) => (
				<UserCard key={u.id} profileData={u} view="card" />
			))}
			<ViewAllCard
				to="/game-masters"
				label="Все мастера"
				className="max-w-3xs w-full min-h-72"
			/>
		</RowSection>
	);
}

export default function HomePage() {
	return (
		<>
			<section className="relative h-[80dvh] min-h-200 p-[1/8]">
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						background:
							"radial-gradient(ellipse 80% 60% at 50% 50%, #1a1028 0%, #0b0814 70%, #07050f 100%)",
					}}
				/>
				<div
					className="absolute inset-0 pointer-events-none"
					aria-hidden
					style={{
						backgroundImage: `
							linear-gradient(to right, rgba(193,55,90,0.10) 1px, transparent 1px),
							linear-gradient(to bottom, rgba(193,55,90,0.10) 1px, transparent 1px)
						`,
						backgroundSize: "80px 80px",
						WebkitMaskImage:
							"radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 70%)",
						maskImage:
							"radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 85%)",
					}}
				/>
				<div
					className="absolute pointer-events-none rounded-full"
					style={{
						left: -40,
						bottom: 60,
						width: 420,
						height: 350,
						background:
							"radial-gradient(ellipse at center, rgba(193,55,90,0.13) 0%, transparent 70%)",
					}}
				/>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-(--border)" />

				<div className="relative max-w-1600 mx-auto px-6 py-32 flex flex-wrap items-center justify-center gap-16 lg:gap-32">
					<div className="flex flex-col gap-16 shrink-0">
						<h1 className="font-display text-4xl leading-tight">
							<span className="block text-(--text-primary)">
								Найди свою
							</span>
							<span className="block text-(--accent)">
								следующую историю
							</span>
						</h1>

						<div className="flex border-(--border) pt-6">
							<HeroStat value="1234" label="Сессий" withDivider />
							<HeroStat value="14" label="Мастеров" withDivider />
							<HeroStat value="123" label="Игроков" />
						</div>
					</div>

					<SearchCard />
				</div>
			</section>

			<div className="max-w-1600 mx-auto px-6 pb-16 pt-4 flex flex-col">
				<ClosestSessionsRow />
				<TopGMsRow />
			</div>
		</>
	);
}
