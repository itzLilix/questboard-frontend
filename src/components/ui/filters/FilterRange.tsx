import Input from "../inputs/Input";

export default function RangeField({
	label,
	suffix,
	type,
	from,
	to,
	onFromChange,
	onToChange,
	disabled,
}: {
	label: string;
	suffix?: string;
	type: "number" | "date";
	from: string;
	to: string;
	onFromChange: (v: string) => void;
	onToChange: (v: string) => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex items-center gap-2">
			{label && (
				<span className="text-base font-body uppercase text-(--text-muted)">
					{label}:
				</span>
			)}
			<Input
				csize="sm"
				type={type}
				placeholder="От"
				value={from}
				disabled={disabled}
				onChange={(e) => onFromChange(e.target.value)}
				className="w-32!"
			/>
			<Input
				csize="sm"
				type={type}
				placeholder="До"
				value={to}
				disabled={disabled}
				onChange={(e) => onToChange(e.target.value)}
				className="w-32!"
			/>
			{suffix && (
				<span className="text-base text-(--text-muted)">{suffix}</span>
			)}
		</div>
	);
}
