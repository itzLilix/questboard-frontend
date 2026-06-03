type InlineInputProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
	maxLength?: number;
};

export default function InlineInput({
	value,
	onChange,
	placeholder,
	className,
	autoFocus,
	maxLength,
}: InlineInputProps) {
	return (
		<input
			type="text"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			autoFocus={autoFocus}
			maxLength={maxLength}
			className={`w-full bg-transparent
				px-1 -mx-1
				outline-none border-b border-(--border) focus:border-(--accent)
				transition-colors placeholder:text-(--text-muted)
				${className || ""}`}
		/>
	);
}
