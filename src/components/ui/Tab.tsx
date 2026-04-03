import { FC } from "react";

type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	isActive?: boolean;
	onClick: () => void;
};

const Tab: FC<TabProps> = ({
	isActive = false,
	onClick,
	className,
	children,
	...props
}) => {
	return (
		<button
			type="button"
			className={`bg-transparent font-display ${isActive ? "text-(--accent) border-(--accent) border-b-2" : "text-(--text-primary)"} ${className || ""}`}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	);
};

export default Tab;
