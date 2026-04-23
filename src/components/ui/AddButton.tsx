import Icon from "./Icon";

type AddButtonProps = {
	onClick: () => void;
	className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function AddButton({
	onClick,
	className,
	disabled,
}: AddButtonProps) {
	return (
		<button
			disabled={disabled}
			onClick={onClick}
			className={`rounded-full 
                w-12 h-12 
                bg-(--surface) p-3 
                border border-(--border) 
                cursor-pointer 
                hover:bg-(--bg-elevated) 
                transition-colors 
                flex align-center justify-center 
                focus:outline-none 
                focus-visible:ring-2 focus-visible:ring-(--accent) 
                focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) 
                active:scale-95 
                ${className || ""}
                disabled:opacity-50 disabled:pointer-events-none`}
		>
			<Icon name="add" className="text-lg text-(--accent)" />
		</button>
	);
}
