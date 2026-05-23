import clsx from "clsx";
import Button from "../Button";
import Icon from "../Icon";

type Props = {
	/**
	 * The filter values currently in scope. The button is enabled whenever
	 * any value is "set" — meaning not `null`/`undefined`, not an empty
	 * string, not `false`, and not an empty array. Pass the same state
	 * variables you also reset in `onClear`.
	 */
	filters: Record<string, unknown>;
	/**
	 * Reset all filters to their default state. Called when the user clicks
	 * the button.
	 */
	onClear: () => void;
	/** Override the default label. */
	label?: string;
	className?: string;
};

function isUnset(v: unknown): boolean {
	return (
		v == null ||
		v === "" ||
		v === false ||
		(Array.isArray(v) && v.length === 0)
	);
}

export default function ClearFiltersButton({
	filters,
	onClear,
	label = "Сбросить фильтры",
	className,
}: Props) {
	const hasActive = Object.values(filters).some((v) => !isUnset(v));

	return (
		<Button
			variant="secondary"
			csize="sm"
			onClick={onClear}
			disabled={!hasActive}
			className={clsx("inline-flex items-center gap-2", className)}
		>
			<Icon name="filter_alt_off" className="text-lg! leading-none!" />
			{label}
		</Button>
	);
}
