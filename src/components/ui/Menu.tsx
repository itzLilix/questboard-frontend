import { cva } from "class-variance-authority";
import type { FC } from "react";
import type React from "react";

type MenuProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
	isOpen: boolean;
	side: "left" | "right" | "top" | "bottom";
};

const sideClasses = cva(
	`bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 absolute z-50`,
	{
		variants: {
			side: {
				left: "left-0 top-full mt-6",
				right: "right-0 top-full mt-6",
				top: "top-0 left-full ml-6",
				bottom: "bottom-0 left-full ml-6",
			},
		},
	},
);

export const MenuItem: FC<{
	children: React.ReactNode;
	onClick: () => void;
	before?: React.ReactNode;
}> = ({ children, onClick, before, ...props }) => {
	return (
		<button
			className="text-base font-body font-(--text-primary) rounded-xl cursor-pointer hover:bg-(--bg-elevated) px-3 py-2 flex items-center gap-2 w-full text-left"
			onClick={onClick}
			{...props}
		>
			{before && (
				<span className="shrink-0 flex items-center">{before}</span>
			)}
			<span className="grow">{children}</span>
		</button>
	);
};

export const MenuDivider: FC = () => {
	return <div className="border-t border-(--border) my-1 w-full" />;
};

const Menu: FC<MenuProps> = ({
	isOpen,
	side,
	children,
	className,
	...props
}) => {
	if (!isOpen) return null;

	return (
		<div className={sideClasses({ side }) + " " + className} {...props}>
			{children}
		</div>
	);
};

export default Menu;
