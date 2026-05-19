import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { ISystemStat } from "../../../types/userCard";
import { OverflowBadge, SystemBadge } from "../SystemBadge";

type Props = {
	stats: ISystemStat[];
	className?: string;
	gapPx?: number;
};

export default function SystemBadgesRow({
	stats,
	className,
	gapPx = 8,
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const measureRef = useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = useState(stats.length);

	useLayoutEffect(() => {
		const container = containerRef.current;
		const measure = measureRef.current;
		if (!container || !measure) return;

		const recompute = () => {
			const available = container.clientWidth;
			const badges = Array.from(
				measure.querySelectorAll<HTMLElement>("[data-badge]"),
			);
			const overflow =
				measure.querySelector<HTMLElement>("[data-overflow]");
			if (badges.length === 0) {
				setVisibleCount(0);
				return;
			}

			let used = 0;
			let fit = 0;
			for (let i = 0; i < badges.length; i++) {
				const w = badges[i].offsetWidth;
				const next = used + (i === 0 ? 0 : gapPx) + w;
				if (next <= available) {
					used = next;
					fit = i + 1;
				} else {
					break;
				}
			}

			if (fit < badges.length && overflow) {
				const overflowW = overflow.offsetWidth + gapPx;
				while (fit > 0 && used + overflowW > available) {
					used -= badges[fit - 1].offsetWidth;
					if (fit > 1) used -= gapPx;
					fit -= 1;
				}
			}

			setVisibleCount(fit);
		};

		recompute();
		const ro = new ResizeObserver(recompute);
		ro.observe(container);
		return () => ro.disconnect();
	}, [stats, gapPx]);

	if (stats.length === 0) return null;

	const visible = stats.slice(0, visibleCount);
	const hidden = stats.slice(visibleCount);

	return (
		<>
			<div
				ref={measureRef}
				aria-hidden
				className="fixed opacity-0 pointer-events-none flex items-center"
				style={{ gap: gapPx, left: -9999, top: -9999 }}
			>
				{stats.map((s) => (
					<span key={`m-${s.id}`} data-badge className="inline-flex">
						<SystemBadge
							system={s}
							sessionsCount={s.sessionsCount}
						/>
					</span>
				))}
				<span data-overflow className="inline-flex">
					<OverflowBadge items={stats} />
				</span>
			</div>

			<div
				ref={containerRef}
				className={clsx(
					"flex items-center w-full min-w-0 overflow-hidden",
					className,
				)}
				style={{ gap: gapPx }}
			>
				{visible.map((s) => (
					<SystemBadge
						key={s.id}
						system={s}
						sessionsCount={s.sessionsCount}
					/>
				))}
				{hidden.length > 0 && <OverflowBadge items={hidden} />}
			</div>
		</>
	);
}
