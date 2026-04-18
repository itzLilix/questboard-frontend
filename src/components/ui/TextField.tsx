import { useState } from "react";
import Icon from "./Icon";

type TextFieldProps = React.HTMLAttributes<HTMLDivElement> &
	(
		| { title: string; isShrinkable?: boolean }
		| { title?: never; isShrinkable?: false }
	);

export default function TextField({
	title,
	isShrinkable = false,
	children,
	className,
	...props
}: TextFieldProps) {
	const [isExpanded, toggleIsExpanded] = useState(true);

	return (
		<div
			className={`bg-(--bg-surface) rounded-xl p-3 w-full border border-(--border) flex flex-col gap-3
                ${isShrinkable ? "cursor-pointer hover:bg-(--bg-elevated)" : ""}
                ${className || ""}`}
			onClick={() =>
				title && isShrinkable && toggleIsExpanded(!isExpanded)
			}
			{...props}
		>
			{title && (
				<h2
					className={`flex items-center gap-2 text-(--text-secondary) font-display text-lg select-none`}
				>
					{isShrinkable && (
						<span
							className={`inline-flex transition-transform duration-200 ${
								isExpanded ? "rotate-0" : "-rotate-90"
							}`}
						>
							<Icon name="expand_more" className="text-sm" />
						</span>
					)}
					{title}
				</h2>
			)}
			{isExpanded && children}
		</div>
	);
}
