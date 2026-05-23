import clsx from "clsx";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useAnchoredPosition from "../../hooks/useAnchoredPosition";
import useClickOutside from "../../hooks/useClickOutside";
import Icon from "./Icon";
import { MultiSelectState } from "../../utils/words";

export type DropdownOption = {
	value: string;
	label: string;
};

type SingleSelectProps = {
	multiple?: false;
	value: string | null;
	onChange: (value: string | null) => void;
};

type MultiSelectProps = {
	multiple: true;
	value: Map<string, MultiSelectState>;
	onChange: (value: Map<string, MultiSelectState>) => void;
};

type DropdownProps = {
	label: string;
	labelIcon?: string;
	options: readonly DropdownOption[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	fullWidth?: boolean;
} & (SingleSelectProps | MultiSelectProps);

function getDisplayText(props: DropdownProps): string {
	const placeholder = props.placeholder ?? "Все";

	if (props.multiple) {
		return props.value.size === 0 ? placeholder : `${props.value.size}`;
	}

	if (props.value === null) return placeholder;
	const selected = props.options.find((o) => o.value === props.value);
	return selected?.label ?? placeholder;
}

function SingleOption({
	option,
	isSelected,
	onSelect,
}: {
	option: DropdownOption;
	isSelected: boolean;
	onSelect: (value: string | null) => void;
}) {
	return (
		<button
			type="button"
			role="option"
			aria-selected={isSelected}
			className="hover:bg-(--bg-elevated) px-3 py-2 flex items-start gap-2 w-full text-left rounded-xl cursor-pointer text-base font-body text-(--text-secondary)"
			onClick={() => onSelect(isSelected ? null : option.value)}
		>
			{isSelected ? (
				<Icon
					name="check"
					className="text-(--accent)! shrink-0 mt-0.5"
				/>
			) : (
				<span className="w-6 shrink-0" />
			)}
			<span
				className={clsx(
					"flex-1 min-w-0",
					isSelected && "text-(--text-primary)",
				)}
			>
				{option.label}
			</span>
		</button>
	);
}

function MultiOption({
	option,
	state,
	onToggle,
}: {
	option: DropdownOption;
	state: MultiSelectState | undefined;
	onToggle: (value: string) => void;
}) {
	return (
		<button
			type="button"
			role="option"
			aria-checked={
				state === MultiSelectState.Included
					? "true"
					: state === MultiSelectState.Excluded
						? "mixed"
						: "false"
			}
			className={clsx(
				"hover:bg-(--bg-elevated) px-3 py-2 flex items-start gap-2 w-full text-left rounded-xl cursor-pointer text-base font-body",
				state === MultiSelectState.Included && "text-(--text-primary)",
				state === MultiSelectState.Excluded && "text-(--error)",
				!state && "text-(--text-secondary)",
			)}
			onClick={() => onToggle(option.value)}
		>
			{state === MultiSelectState.Included && (
				<Icon
					name="check_circle"
					className="text-(--accent)! shrink-0 mt-0.5"
				/>
			)}
			{state === MultiSelectState.Excluded && (
				<Icon
					name="cancel"
					className="text-(--error)! shrink-0 mt-0.5"
				/>
			)}
			{!state && <span className="w-6 shrink-0" />}
			<span className="flex-1 min-w-0">{option.label}</span>
		</button>
	);
}

export default function Dropdown(props: DropdownProps) {
	const { label, labelIcon, options, className, disabled } = props;
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const close = useCallback(() => setIsOpen(false), []);
	useClickOutside(containerRef, isOpen, close, listRef);
	const pos = useAnchoredPosition(triggerRef, isOpen);

	const displayOptions = props.multiple
		? [...options].sort(
				(a, b) =>
					(props.value.has(a.value) ? 0 : 1) -
					(props.value.has(b.value) ? 0 : 1),
			)
		: options;

	function handleMultiToggle(value: string) {
		if (!props.multiple) return;
		const next = new Map(props.value);
		const current = next.get(value);
		if (!current) {
			next.set(value, MultiSelectState.Included);
		} else if (current === MultiSelectState.Included) {
			next.set(value, MultiSelectState.Excluded);
		} else {
			next.delete(value);
		}
		props.onChange(next);
	}

	return (
		<div ref={containerRef} className={clsx("relative", className)}>
			<button
				ref={triggerRef}
				type="button"
				className={clsx(
					props.fullWidth && "w-full justify-center h-12",
					"inline-flex items-center gap-2 h-10 rounded-xl border border-(--border) px-4 bg-(--bg-surface) cursor-pointer transition-colors duration-200 hover:bg-(--bg-elevated) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) disabled:opacity-50 disabled:pointer-events-none",
				)}
				disabled={disabled}
				onClick={() => setIsOpen((o) => !o)}
				onKeyDown={(e) => {
					if (e.key === "Escape" && isOpen) {
						e.stopPropagation();
						setIsOpen(false);
					}
				}}
			>
				{labelIcon && (
					<Icon name={labelIcon} className="text-(--accent)" />
				)}
				{label !== "" && (
					<span className="text-base font-body uppercase text-(--text-muted)">
						{label + ":"}
					</span>
				)}
				<span className="grid text-base font-body text-(--text-secondary) *:col-start-1 *:row-start-1 max-w-40 overflow-hidden">
					<span className="invisible truncate">
						{props.placeholder ?? "Все"}
					</span>
					<span className="truncate">{getDisplayText(props)}</span>
				</span>
				<Icon
					name="expand_more"
					className={clsx(
						"text-lg! text-(--text-muted)! transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen &&
				pos &&
				createPortal(
					<div
						ref={listRef}
						role="listbox"
						style={{
							position: "fixed",
							top: pos.top,
							bottom: pos.bottom,
							left: pos.left,
							minWidth: pos.width,
							maxHeight: pos.maxHeight,
						}}
						className="z-50 bg-(--bg-base-tp) overflow-y-auto backdrop-blur-lg border border-(--border) rounded-lg p-2"
					>
						{props.multiple
							? displayOptions.map((option) => (
									<MultiOption
										key={option.value}
										option={option}
										state={props.value.get(option.value)}
										onToggle={handleMultiToggle}
									/>
								))
							: displayOptions.map((option) => (
									<SingleOption
										key={option.value}
										option={option}
										isSelected={props.value === option.value}
										onSelect={(v) => {
											props.onChange(v);
											setIsOpen(false);
										}}
									/>
								))}
					</div>,
					document.body,
				)}
		</div>
	);
}
