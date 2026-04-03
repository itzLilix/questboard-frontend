export const Loading = ({ className }: { className?: string }) => {
	return (
		<span
			className={`material-symbols-outlined text-(--accent) animate-spin ${className || ""}`}
		>
			progress_activity
		</span>
	);
};

export default Loading;
