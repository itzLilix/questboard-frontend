import FilterToggle from "./FilterToggle";
import Icon from "./Icon";
import { SortOrder } from "../../types/query";

export default function ToggleSortOrder({
	sortOrder,
	onToggle,
}: {
	sortOrder: SortOrder;
	onToggle: () => void;
}) {
	const isAsc = sortOrder === SortOrder.Asc;
	return (
		<FilterToggle
			isActive={false}
			onChange={onToggle}
			title={isAsc ? "По возрастанию" : "По убыванию"}
		>
			<Icon
				name={isAsc ? "arrow_upward" : "arrow_downward"}
				className="text-lg! leading-none! text-(--text-muted)!"
			/>
		</FilterToggle>
	);
}
