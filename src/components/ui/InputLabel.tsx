export function InputLabel({ children }: { children: React.ReactNode }) {
	return <span className="text-base text-(--text-primary)">{children}</span>;
}

export function LabeledInput({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<InputLabel>{label}</InputLabel>
			{children}
		</div>
	);
}
