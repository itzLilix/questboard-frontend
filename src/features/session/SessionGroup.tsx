import { useState, type ReactNode } from "react";
import clsx from "clsx";
import Icon from "../../components/ui/Icon";
import { pluralGames } from "../../utils/words";

type SessionGroupProps = {
	title: ReactNode;
	count: number;
	children: ReactNode;
	defaultOpen?: boolean;
};

export default function SessionGroup({
	title,
	count,
	children,
	defaultOpen = true,
}: SessionGroupProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<section className="flex flex-col gap-3">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex items-center gap-2 self-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base) rounded-md px-1 -mx-1"
				aria-expanded={open}
			>
				<Icon
					name="expand_more"
					className={clsx(
						"text-2xl! text-(--accent)! transition-transform duration-200",
						!open && "-rotate-90",
					)}
				/>
				<span className="font-display text-2xl text-(--text-primary)">
					{title}
				</span>
				<span className="text-base text-(--text-muted)">
					{count} {pluralGames(count)}
				</span>
			</button>
			{open && (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
					{children}
				</div>
			)}
		</section>
	);
}
