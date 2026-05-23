import clsx from "clsx";
import Icon from "../Icon";

export type ChipItem = {
	key: string;
	label: string;
	value: string;
	variant?: "default" | "danger";
	onRemove: () => void;
};

type Props = {
	chips: ChipItem[];
	className?: string;
};

export default function ActiveFilterChips({ chips, className }: Props) {
	if (chips.length === 0) return null;
	return (
		<div className={clsx("flex flex-wrap gap-2", className)}>
			{chips.map((c) => (
				<Chip key={c.key} chip={c} />
			))}
		</div>
	);
}

function Chip({ chip }: { chip: ChipItem }) {
	const variant = chip.variant ?? "default";
	return (
		<button
			type="button"
			onClick={chip.onRemove}
			className={clsx(
				"group inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border text-sm font-body cursor-pointer transition-colors",
				variant === "default" &&
					"bg-(--bg-card) border-(--border) text-(--text-primary) hover:bg-(--bg-elevated)",
				variant === "danger" &&
					"bg-(--bg-surface) border-(--border) text-(--error) hover:bg-(--bg-elevated)",
			)}
			aria-label={`Убрать фильтр: ${chip.label} ${chip.value}`}
		>
			<span className="text-(--text-muted) text-xs uppercase">
				{chip.label}:
			</span>
			<span className="max-w-40 truncate">{chip.value}</span>
			<Icon
				name="close"
				className="text-sm! text-(--text-muted) group-hover:text-(--text-primary)"
			/>
		</button>
	);
}
