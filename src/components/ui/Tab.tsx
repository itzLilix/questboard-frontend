type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	isActive?: boolean;
	onClick: () => void;
};

export default function Tab({
	isActive = false,
	onClick,
	className,
	children,
	...props
}: TabProps) {
	return (
		<button
			type="button"
			className={`bg-transparent font-display cursor-pointer ${isActive ? "text-(--accent) border-(--accent) border-b-2" : "text-(--text-primary)"} ${className || ""}`}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	);
}
