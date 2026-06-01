import { useState, type ReactNode } from "react";
import clsx from "clsx";
import Icon from "./Icon";

export default function CollapsibleSection({
	title,
	children,
	defaultOpen = true,
}: {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<section className="flex flex-col gap-2">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className="flex items-center gap-1 w-fit text-(--text-secondary) text-base cursor-pointer"
			>
				<span>{title}</span>
				<Icon
					name="keyboard_arrow_down"
					className={clsx(
						"text-base! transition-transform",
						open && "rotate-180",
					)}
				/>
			</button>
			{open && children}
		</section>
	);
}
