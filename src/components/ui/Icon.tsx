export default function Icon({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	return (
		<span
			className={`material-symbols-outlined select-none ${className || ""}`}
		>
			{name}
		</span>
	);
}
