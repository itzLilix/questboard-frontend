import { useLayoutEffect, useRef } from "react";

type InlineTextAreaProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
	maxLength?: number;
};

export default function InlineTextArea({
	value,
	onChange,
	placeholder,
	className,
	autoFocus,
	maxLength,
}: InlineTextAreaProps) {
	const ref = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, [value]);

	return (
		<textarea
			ref={ref}
			rows={1}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			autoFocus={autoFocus}
			maxLength={maxLength}
			className={`w-full resize-none bg-transparent rounded-md
				px-1 -mx-1
				outline-none ring-1 ring-(--border) focus:ring-(--accent)
				transition-colors placeholder:text-(--text-muted)
				${className || ""}`}
		/>
	);
}
