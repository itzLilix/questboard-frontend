import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import Input from "./inputs/Input";
import useAnchoredPosition from "../../hooks/useAnchoredPosition";
import useClickOutside from "../../hooks/useClickOutside";
import type { ISystem } from "../../types/userCard";
import {
	useCreateSystemMutation,
	useCuratedSystemsQuery,
	useSystemSearchQuery,
} from "../../features/session/queries";

type CommonProps = {
	placeholder?: string;
	className?: string;
	disabled?: boolean;
};

type SingleProps = CommonProps & {
	multiple?: false;
	value: ISystem | null;
	onChange: (value: ISystem | null) => void;
};

type MultiProps = CommonProps & {
	multiple: true;
	onAdd: (system: ISystem) => void;
	onExclude: (system: ISystem) => void;
};

type SystemSearchProps = SingleProps | MultiProps;

const DEBOUNCE_MS = 300;

export default function SystemSearch(props: SystemSearchProps) {
	const { placeholder = "Поиск системы...", className, disabled } = props;
	const isMulti = props.multiple === true;

	const [query, setQuery] = useState(
		!isMulti ? (props.value?.name ?? "") : "",
	);
	const [debouncedQ, setDebouncedQ] = useState(query);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const singleValue = !isMulti ? props.value : null;
	const [prevSingle, setPrevSingle] = useState(singleValue);
	if (!isMulti && prevSingle !== singleValue) {
		setPrevSingle(singleValue);
		setQuery(singleValue?.name ?? "");
	}

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [query]);

	const hasSearch = debouncedQ.trim().length > 0;
	const { data: searchResults = [], isFetching } =
		useSystemSearchQuery(debouncedQ);
	const { data: curated = [] } = useCuratedSystemsQuery();
	const results = hasSearch ? searchResults : curated;

	const createMutation = useCreateSystemMutation(query);
	const close = useCallback(() => setIsOpen(false), []);
	useClickOutside(containerRef, isOpen, close, listRef);
	const pos = useAnchoredPosition(anchorRef, isOpen);

	const handleSingleSelect = (system: ISystem) => {
		if (props.multiple) return;
		props.onChange(system);
		setQuery(system.name);
		setIsOpen(false);
	};

	const handleSingleClear = () => {
		if (props.multiple) return;
		props.onChange(null);
		setQuery("");
		setIsOpen(false);
	};

	const handleAddCustom = () => {
		if (props.multiple) return;
		createMutation.mutate(undefined, {
			onSuccess: (system) => {
				props.onChange(system);
				setQuery(system.name);
				setIsOpen(false);
			},
		});
	};

	const trimmed = query.trim();
	const showAddOption =
		!isMulti && trimmed.length > 0 && results.length === 0;

	return (
		<div ref={containerRef} className={clsx("relative", className)}>
			<div ref={anchorRef} className="relative flex items-center">
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
						if (!props.multiple && e.target.value === "")
							props.onChange(null);
						if (createMutation.isError) createMutation.reset();
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
						onClick={
							props.multiple
								? () => setQuery("")
								: handleSingleClear
						}
						className="absolute right-2 p-1 rounded-full text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer"
						aria-label="Очистить"
					>
						<Icon name="close" className="text-base!" />
					</button>
				)}
			</div>

			{!props.multiple && props.value && !props.value.isCurated && (
				<p className="mt-1 text-xs text-(--text-muted)">
					Пользовательская система
				</p>
			)}

			{createMutation.isError && (
				<p className="mt-1 text-xs text-(--error)">
					Система с таким названием уже существует
				</p>
			)}

			{isOpen &&
				pos &&
				createPortal(
					<div
						ref={listRef}
						style={{
							position: "fixed",
							top: pos.top,
							bottom: pos.bottom,
							left: pos.left,
							width: pos.width,
							maxHeight: pos.maxHeight,
						}}
						className="z-50 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 flex flex-col overflow-y-auto"
					>
						{isFetching && results.length === 0 && (
							<span className="px-3 py-2 text-sm text-(--text-muted)">
								Поиск...
							</span>
						)}

						{results.length > 0 &&
							results.map((s: ISystem) =>
								props.multiple ? (
									<MultiRow
										key={s.slug}
										system={s}
										onAdd={() => props.onAdd(s)}
										onExclude={() => props.onExclude(s)}
									/>
								) : (
									<SingleRow
										key={s.slug}
										system={s}
										onSelect={() => handleSingleSelect(s)}
									/>
								),
							)}

						{showAddOption && (
							<button
								type="button"
								onClick={handleAddCustom}
								disabled={createMutation.isPending}
								className="flex items-center gap-2 px-3 py-2 rounded-xl text-base text-left hover:bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary) transition-colors mt-1 pt-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
							>
								<Icon
									name="add"
									className="text-base! shrink-0"
								/>
								<span>
									Добавить «
									<span className="text-(--text-primary)">
										{trimmed}
									</span>
									»
								</span>
							</button>
						)}
					</div>,
					document.body,
				)}
		</div>
	);
}

function SystemIcon({ system }: { system: ISystem }) {
	return system.isCurated ? (
		<Icon name="verified" className="text-(--accent) text-base! shrink-0" />
	) : (
		<Icon
			name="group"
			className="text-(--text-secondary) text-base! shrink-0"
		/>
	);
}

function SingleRow({
	system,
	onSelect,
}: {
	system: ISystem;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className="flex items-center gap-2 px-3 py-2 rounded-xl text-base text-left hover:bg-(--bg-elevated) text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer"
		>
			<SystemIcon system={system} />
			<span>{system.name}</span>
		</button>
	);
}

function MultiRow({
	system,
	onAdd,
	onExclude,
}: {
	system: ISystem;
	onAdd: () => void;
	onExclude: () => void;
}) {
	return (
		<div className="group flex items-center gap-2 px-2 py-1 rounded-xl text-base text-(--text-secondary) hover:bg-(--bg-elevated) transition-colors">
			<button
				type="button"
				onClick={onAdd}
				className="p-1 rounded-full cursor-pointer text-(--text-muted)! hover:text-(--accent)! transition-colors shrink-0"
				aria-label="Включить"
			>
				<Icon name="add" className="text-base!" />
			</button>
			<button
				type="button"
				onClick={onExclude}
				className="p-1 rounded-full cursor-pointer text-(--text-muted)! hover:text-(--error)! transition-colors shrink-0"
				aria-label="Исключить"
			>
				<Icon name="remove" className="text-base!" />
			</button>
			<SystemIcon system={system} />
			<span className="flex-1 min-w-0 truncate">{system.name}</span>
		</div>
	);
}
