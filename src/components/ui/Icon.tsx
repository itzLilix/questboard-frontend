export default function Icon({
	name,
	className,
}: {
	name: string;
	size?: number;
	className?: string;
}) {
	return (
		<span
			className={`material-symbols-outlined select-none leading-none ${className || ""}`}
		>
			{name}
		</span>
	);
}
