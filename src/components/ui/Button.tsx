import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { type FC } from "react";

const buttonVariants = cva(
	`inline-flex items-center justify-center 
	rounded-lg 
	font-base 
	transition-colors duration-200 
	cursor-pointer
	focus:outline-none 
	focus-visible:ring-2 focus-visible:ring-(--accent) 
	focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) 
	active:scale-95 
	disabled:opacity-50 disabled:pointer-events-none`,
	{
		variants: {
			variant: {
				primary:
					"bg-(--accent) text-(--text-primary) hover:bg-(--accent-hover)",
				secondary:
					"bg-transparent text-(--text-secondary) border border-(--border) hover:bg-(--bg-elevated) hover:text-(--text-primary)",
			},
			csize: {
				sm: "px-4 py-2",
				md: "px-6 py-3",
			},
			fullWidth: {
				true: "w-full",
			},
		},
		defaultVariants: {
			variant: "secondary",
			csize: "sm",
		},
	},
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

const Button: FC<ButtonProps> = ({
	className,
	variant,
	csize,
	fullWidth,
	disabled,
	children,
	...props
}) => {
	return (
		<button
			type="button"
			className={clsx(
				buttonVariants({ variant, csize, fullWidth }),
				className,
			)}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
