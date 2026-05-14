import clsx from "clsx";
import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "../../components/ui/Icon";
import useClickOutside from "../../hooks/useClickOutside";
import type { ISystem } from "../../types/userCard";
import { useCuratedSystemsQuery, useSystemSearchQuery } from "./queries";
import Input from "../../components/ui/Input";

type SystemSearchProps = {
	value: ISystem | null;
	onChange: (value: ISystem | null) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
};

const DEBOUNCE_MS = 300;

export default function SystemSearch({
	value,
	onChange,
	placeholder = "Поиск системы...",
	className,
	disabled,
}: SystemSearchProps) {
	const [query, setQuery] = useState(value?.name ?? "");
	const [debouncedQ, setDebouncedQ] = useState(query);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const [prevValue, setPrevValue] = useState(value);

	if (prevValue !== value) {
		setPrevValue(value);
		setQuery(value?.name ?? "");
	}

	useEffect(() => {
		console.log(query);
		const t = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [query]);

	const hasSearch = debouncedQ.trim().length > 0;
	const { data: searchResults = [], isFetching } =
		useSystemSearchQuery(debouncedQ);
	const { data: curated = [] } = useCuratedSystemsQuery();
	const results = hasSearch ? searchResults : curated;

	const close = useCallback(() => setIsOpen(false), []);
	useClickOutside(containerRef, isOpen, close);

	const handleSelect = (system: ISystem) => {
		onChange(system);
		setQuery(system.name);
		setIsOpen(false);
	};

	const handleAddCustom = () => {
		const custom: ISystem = {
			slug: query.trim().toLowerCase().replace(/\s+/g, "-"),
			name: query.trim(),
			isCurated: false,
		};
		onChange(custom);
		setIsOpen(false);
	};

	const handleClear = () => {
		onChange(null);
		setQuery("");
		setIsOpen(false);
	};

	const trimmed = query.trim();
	const showAddOption = trimmed.length > 0 && results.length === 0;

	return (
		<div ref={containerRef} className={clsx("relative", className)}>
			<div className="relative flex items-center">
				<Icon
					name="search"
					className="absolute left-3 text-(--text-muted) pointer-events-none"
				/>
				<Input
					type="text"
					value={query}
					placeholder={placeholder}
					disabled={disabled}
					className="pl-10 pr-8"
					onChange={(e) => {
						setQuery(e.target.value);
						if (!isOpen) setIsOpen(true);
						if (e.target.value === "") onChange(null);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							e.stopPropagation();
							close();
						}
					}}
				/>
				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2 p-1 rounded-full text-(--text-muted) hover:text-(--text-primary) transition-colors"
						aria-label="Очистить"
					>
						<Icon name="close" className="text-base!" />
					</button>
				)}
			</div>

			{value && !value.isCurated && (
				<p className="mt-1 text-xs text-(--text-muted)">
					Пользовательская система
				</p>
			)}

			{isOpen && (
				<div className="absolute z-50 top-full mt-2 left-0 right-0 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 flex flex-col overflow-y-scroll max-h-[50dvh]">
					{isFetching && results.length === 0 && (
						<span className="px-3 py-2 text-sm text-(--text-muted)">
							Поиск...
						</span>
					)}

					{results.length > 0 &&
						results.map((s: ISystem) => (
							<button
								key={s.slug}
								type="button"
								onClick={() => handleSelect(s)}
								className="flex items-center gap-2 px-3 py-2 rounded-xl text-base text-left hover:bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
							>
								{s.isCurated && (
									<Icon
										name="verified"
										className="text-(--accent) text-base! shrink-0"
									/>
								)}
								{!s.isCurated && (
									<span className="w-6 shrink-0" />
								)}
								<span>{s.name}</span>
							</button>
						))}

					{showAddOption && (
						<button
							type="button"
							onClick={handleAddCustom}
							className="flex items-center gap-2 px-3 py-2 rounded-xl text-base text-left hover:bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary) transition-colors mt-1 pt-2"
						>
							<Icon name="add" className="text-base! shrink-0" />
							<span>
								Добавить «
								<span className="text-(--text-primary)">
									{trimmed}
								</span>
								»
							</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
}
