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
				"inline-flex items-center px-2.5 py-1 rounded-md text-sm font-bold uppercase whitespace-nowrap text-(--text-primary) select-none",
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
					{items.map((s) => (
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

const ESTIMATED_POPOVER_PX = 240;

function BadgePopover({
	content,
	children,
}: {
	content: React.ReactNode;
	children: React.ReactNode;
}) {
	const wrapperRef = useRef<HTMLSpanElement>(null);
	const [openAlign, setOpenAlign] = useState<"left" | "right" | null>(null);

	const open = () => {
		const trigger = wrapperRef.current?.getBoundingClientRect();
		if (!trigger) {
			setOpenAlign("left");
			return;
		}
		const fitsRight =
			trigger.left + ESTIMATED_POPOVER_PX <= window.innerWidth - 8;
		setOpenAlign(fitsRight ? "left" : "right");
	};

	return (
		<span
			ref={wrapperRef}
			className="relative inline-flex"
			onMouseEnter={open}
			onMouseLeave={() => setOpenAlign(null)}
			onFocus={open}
			onBlur={() => setOpenAlign(null)}
		>
			{children}
			{openAlign && (
				<div
					role="tooltip"
					className={clsx(
						"absolute z-20 top-full mt-2 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text-secondary) shadow-lg whitespace-nowrap pointer-events-none",
						openAlign === "left" ? "left-0" : "right-0",
					)}
				>
					{content}
				</div>
			)}
		</span>
	);
}
