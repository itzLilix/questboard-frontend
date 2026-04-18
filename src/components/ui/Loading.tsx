import Icon from "./Icon";

export default function Loading({ className }: { className?: string }) {
	return (
		<Icon
			name="progress_activity"
			className={`animate-spin text-(--accent) ${className || ""}`}
		/>
	);
}
