import { useRef, useState } from "react";
import clsx from "clsx";
import type { ISystem, ISystemStat } from "../../types/userCard";
import { pluralPartiy } from "../../utils/words";

const DEFAULT_BADGE_COLOR = "#2a2440";

type SystemBadgeProps = {
	system: ISystem;
	sessionsCount?: number;
	className?: string;
};

export function SystemBadge({
	system,
	sessionsCount,
	className,
}: SystemBadgeProps) {
	const pill = (
		<span
			className={clsx(
				"inline-flex items-center px-2.5 py-1 rounded-md text-sm font-body font-bold uppercase whitespace-nowrap text-(--text-primary) select-none",
				className,
			)}
			style={{
				backgroundColor: system.badgeColor || DEFAULT_BADGE_COLOR,
			}}
		>
			{system.name}
		</span>
	);

	if (sessionsCount === undefined) return pill;

	return (
		<BadgePopover
			content={
				<span>
					{sessionsCount} {pluralPartiy(sessionsCount)}
				</span>
			}
		>
			{pill}
		</BadgePopover>
	);
}

type OverflowBadgeProps = {
	items: ISystemStat[];
	className?: string;
};

export function OverflowBadge({ items, className }: OverflowBadgeProps) {
	return (
		<BadgePopover
			content={
				<ul className="flex flex-col gap-1">
					{items.slice(0, 10).map((s) => (
						<li
							key={s.id}
							className="flex items-center justify-between gap-3"
						>
							<span className="font-bold uppercase text-(--text-primary)">
								{s.name}
							</span>
							<span className="text-(--text-secondary)">
								{s.sessionsCount}{" "}
								{pluralPartiy(s.sessionsCount)}
							</span>
						</li>
					))}
				</ul>
			}
		>
			<span
				className={clsx(
					"inline-flex items-center px-2 py-1 text-sm text-(--text-secondary) select-none whitespace-nowrap",
					className,
				)}
			>
				+{items.length}
			</span>
		</BadgePopover>
	);
}

function BadgePopover({
	content,
	children,
}: {
	content: React.ReactNode;
	children: React.ReactNode;
}) {
	const wrapperRef = useRef<HTMLSpanElement>(null);
	const [isOpen, open] = useState<boolean>(false);

	return (
		<span
			ref={wrapperRef}
			className="relative inline-flex"
			onMouseEnter={() => open(true)}
			onMouseLeave={() => open(false)}
			onFocus={() => open(true)}
			onBlur={() => open(false)}
		>
			{children}
			{isOpen && (
				<div
					role="tooltip"
					className={clsx(
						"absolute z-20 bottom-full mb-2 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text-secondary) shadow-lg whitespace-nowrap pointer-events-none",
						isOpen && "left-1/2 transform -translate-x-1/2",
					)}
				>
					{content}
				</div>
			)}
		</span>
	);
}
