import Icon from "./Icon";

export default function AddButton({
	onClick,
	className,
}: {
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
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
                ${className || ""}`}
		>
			<Icon name="add" className="text-lg text-(--accent)" />
		</button>
	);
}
