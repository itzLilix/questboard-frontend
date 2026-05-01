import clsx from "clsx";
import { useCallback, useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import Icon from "./Icon";

export type DropdownOption = {
	value: string;
	label: string;
};

export type MultiSelectState = "included" | "excluded";

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
	options: DropdownOption[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
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
			className="hover:bg-(--bg-elevated) px-3 py-2 flex items-center gap-2 w-full text-left rounded-xl cursor-pointer text-base font-body text-(--text-secondary)"
			onClick={() => onSelect(isSelected ? null : option.value)}
		>
			{isSelected ? (
				<Icon name="check" className="text-base! text-(--accent)!" />
			) : (
				<span className="w-5" />
			)}
			<span>{option.label}</span>
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
				state === "included"
					? "true"
					: state === "excluded"
						? "mixed"
						: "false"
			}
			className={clsx(
				"hover:bg-(--bg-elevated) px-3 py-2 flex items-center gap-2 w-full text-left rounded-xl cursor-pointer text-base font-body",
				state === "included" && "text-(--text-primary)",
				state === "excluded" && "text-(--error)",
				!state && "text-(--text-secondary)",
			)}
			onClick={() => onToggle(option.value)}
		>
			{state === "included" && (
				<Icon
					name="check_circle"
					className="text-base! text-(--accent)!"
				/>
			)}
			{state === "excluded" && (
				<Icon name="cancel" className="text-base! text-(--error)!" />
			)}
			{!state && <span className="w-5" />}
			<span>{option.label}</span>
		</button>
	);
}

export default function Dropdown(props: DropdownProps) {
	const { label, options, className, disabled } = props;
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const close = useCallback(() => setIsOpen(false), []);
	useClickOutside(containerRef, isOpen, close);

	function handleMultiToggle(value: string) {
		if (!props.multiple) return;
		const next = new Map(props.value);
		const current = next.get(value);
		if (!current) {
			next.set(value, "included");
		} else if (current === "included") {
			next.set(value, "excluded");
		} else {
			next.delete(value);
		}
		props.onChange(next);
	}

	return (
		<div ref={containerRef} className={clsx("relative", className)}>
			<button
				type="button"
				className="inline-flex items-center gap-2 h-10 rounded-xl border border-(--border) px-4 bg-(--bg-surface) cursor-pointer transition-colors duration-200 hover:bg-(--bg-elevated) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) disabled:opacity-50 disabled:pointer-events-none"
				disabled={disabled}
				onClick={() => setIsOpen((o) => !o)}
				onKeyDown={(e) => {
					if (e.key === "Escape" && isOpen) {
						e.stopPropagation();
						setIsOpen(false);
					}
				}}
			>
				<span className="text-base font-body uppercase text-(--text-muted)">
					{label}:
				</span>
				<span className="grid text-base font-body text-(--text-secondary) *:col-start-1 *:row-start-1">
					<span className="invisible">
						{props.placeholder ?? "Все"}
					</span>
					<span>{getDisplayText(props)}</span>
				</span>
				<Icon
					name="expand_more"
					className={clsx(
						"text-lg! text-(--text-muted)! transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div
					role="listbox"
					className="absolute z-50 top-full mt-2 left-0 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 min-w-full"
				>
					{props.multiple
						? options.map((option) => (
								<MultiOption
									key={option.value}
									option={option}
									state={props.value.get(option.value)}
									onToggle={handleMultiToggle}
								/>
							))
						: options.map((option) => (
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
				</div>
			)}
		</div>
	);
}
