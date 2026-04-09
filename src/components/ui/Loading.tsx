import Icon from "./Icon";

export const Loading = ({ className }: { className?: string }) => {
	return (
		<Icon
			name="progress_activity"
			className={`animate-spin text-(--accent) ${className || ""}`}
		/>
	);
};

export default Loading;
