import clsx from "clsx";
import Icon from "../Icon";

type Props = {
	onClick: () => void;
	count?: number;
	label?: string;
	className?: string;
	disabled?: boolean;
};

export default function FilterButton({
	onClick,
	count = 0,
	label = "Фильтры",
	className,
	disabled,
}: Props) {
	const isActive = count > 0;
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				"inline-flex items-center gap-2 h-10 rounded-xl border px-4 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) disabled:opacity-50 disabled:pointer-events-none",
				isActive
					? "bg-(--accent-soft) border-(--accent) text-(--text-primary) hover:bg-(--bg-elevated)"
					: "bg-(--bg-surface) border-(--border) text-(--text-secondary) hover:bg-(--bg-elevated)",
				className,
			)}
		>
			<Icon
				name="filter_alt"
				className={
					isActive ? "text-(--accent)!" : "text-(--text-muted)!"
				}
			/>
			<span className="text-base font-body">{label}</span>
			{count > 0 && (
				<span className="bg-(--accent) text-(--text-primary) rounded-full min-w-5 h-5 inline-flex items-center justify-center text-xs px-1.5">
					{count}
				</span>
			)}
		</button>
	);
}
