import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const toggleVariants = cva(
	`inline-flex items-center justify-center h-10
	rounded-xl border
	text-base font-body
	px-4
	cursor-pointer
	transition-colors duration-200
	focus:outline-none
	focus-visible:ring-2 focus-visible:ring-(--accent)
	focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base)
	active:scale-95
	disabled:opacity-50 disabled:pointer-events-none`,
	{
		variants: {
			isActive: {
				false: "border-(--border) text-(--text-secondary) bg-(--bg-surface) hover:bg-(--bg-elevated)",
				true: "bg-(--accent-soft) border-(--accent) text-(--text-primary)",
			},
		},
		defaultVariants: {
			isActive: false,
		},
	},
);

type FilterToggleProps = {
	label?: string;
	isActive: boolean;
	onChange: (active: boolean) => void;
	className?: string;
	children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">;

export default function FilterToggle({
	label,
	isActive,
	onChange,
	className,
	children,
	...props
}: FilterToggleProps) {
	return (
		<button
			type="button"
			className={clsx(toggleVariants({ isActive }), className)}
			onClick={() => onChange(!isActive)}
			{...props}
		>
			{children ?? label}
		</button>
	);
}
