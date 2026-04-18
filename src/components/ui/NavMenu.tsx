import clsx from "clsx";
import { type FC, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

type NavMenuProps = {
	children: ReactNode;
	className?: string;
};

export const NavMenu: FC<NavMenuProps> = ({ children, className }) => {
	return (
		<nav className={clsx("flex flex-col gap-3 w-full", className)}>
			{children}
		</nav>
	);
};

type NavMenuItemProps = {
	to: string;
	children: ReactNode;
	before?: ReactNode;
	end?: boolean;
	className?: string;
};

export const NavMenuItem: FC<NavMenuItemProps> = ({
	to,
	children,
	before,
	end,
	className,
}) => {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) =>
				clsx(
					"font-body text-base p-4 rounded-lg flex items-center justify-start gap-2 border transition-colors bg-(--bg-card)",
					isActive
						? "text-(--text-primary) border-(--accent) relative before:absolute before:inset-y-0 before:-left-3 before:w-1 before:bg-(--accent) before:rounded-lg"
						: "text-(--text-primary) border-(--border) hover:bg-(--bg-elevated)",
					className,
				)
			}
		>
			{before && (
				<span className="shrink-0 flex items-center">{before}</span>
			)}
			<span className="grow">{children}</span>
		</NavLink>
	);
};

export default NavMenu;
