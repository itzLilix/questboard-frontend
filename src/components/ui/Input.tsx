type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	csize?: "sm" | "md";
};

export default function Input({
	csize = "md",
	className,
	disabled,
	...props
}: InputProps) {
	return (
		<input
			className={`
				bg-(--bg-surface)
				text-(--text-primary)
				border border-(--border)
				rounded-xl
                w-full ${csize === "sm" ? "max-w-80" : ""}
                px-3 ${csize === "sm" ? "py-2" : "py-3"}
				focus:outline-none focus:ring-2 focus:ring-(--accent)
				focus:ring-offset-2 focus:ring-offset-(--bg-base)
				transition-colors duration-200
				placeholder:text-(--text-muted)
				disabled:opacity-50 disabled:pointer-events-none
				${className || ""}
			`}
			disabled={disabled}
			{...props}
		/>
	);
}
