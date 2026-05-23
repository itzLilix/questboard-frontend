import FilterToggle from "./filters/FilterToggle";
import Icon from "./Icon";

type ToggleViewProps = {
	view: "table" | "card";
	setView: (view: "table" | "card") => void;
};

export default function ToggleView({ view, setView }: ToggleViewProps) {
	return (
		<FilterToggle
			isActive={false}
			onChange={() => setView(view === "table" ? "card" : "table")}
		>
			<Icon
				name={view === "table" ? "view_agenda" : "grid_view"}
				className="text-lg! leading-none!"
			/>
		</FilterToggle>
	);
}
