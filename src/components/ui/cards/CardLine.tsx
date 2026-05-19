import TextSeparator from "../TextSeparator";

export function CardLine<T extends string>({
	label,
	value,
	allLabels,
}: {
	label: string;
	value?: T;
	allLabels: Record<T, string>;
}) {
	const displayValue = value ? (
		allLabels[value]
	) : (
		<span>
			{Object.values<string>(allLabels).map((val, index) => (
				<span key={index}>
					{index > 0 && <TextSeparator />}
					{val}
				</span>
			))}
		</span>
	);

	return (
		<p>
			<CardLabel text={label} /> <span>{displayValue}</span>
		</p>
	);
}

export function CardLabel({ text }: { text: string }) {
	return (
		<span className="text-sm text-(--text-muted)">
			{text.toUpperCase() + ":"}
		</span>
	);
}
