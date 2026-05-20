import FilterToggle from "./FilterToggle";
import Icon from "./Icon";

export default function ToggleSortOrder({
	sortOrder,
	onToggle,
}: {
	sortOrder: "asc" | "desc";
	onToggle: () => void;
}) {
	return (
		<FilterToggle
			isActive={false}
			onChange={onToggle}
			title={sortOrder === "asc" ? "По возрастанию" : "По убыванию"}
		>
			<Icon
				name={sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
				className="text-lg! leading-none! text-(--text-muted)!"
			/>
		</FilterToggle>
	);
}
