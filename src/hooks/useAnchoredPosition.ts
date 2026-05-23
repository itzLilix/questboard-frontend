import { useLayoutEffect, useState, type RefObject } from "react";

export type AnchorAlign = "start" | "end";

export type AnchoredPosition = {
	/** CSS `top` in px. Set when placed below the anchor. */
	top?: number;
	/** CSS `bottom` in px (distance from viewport bottom). Set when flipped above. */
	bottom?: number;
	/** Set when `align: "start"`. Anchor's left edge. */
	left?: number;
	/** Set when `align: "end"`. Distance from viewport right to anchor's right edge. */
	right?: number;
	/** Anchor element's width — useful as `minWidth` on the popover. */
	width: number;
	maxHeight: number;
};

const GAP = 8;
const VIEWPORT_MARGIN = 8;
/** If there's at least this much room below, prefer placing below even if above has more. */
const COMFORTABLE_BELOW = 240;

/**
 * Track the position of a portal'd popover anchored to `anchorRef`.
 *
 * - Repositions on scroll (capture, so nested scroll containers count) and
 *   window resize while `isOpen` is true.
 * - Flips above the anchor when there isn't enough room below.
 * - Clamps to keep the popover inside the viewport.
 * - Returns a `maxHeight` that fills the chosen side without overflowing.
 *
 * `align` controls horizontal alignment:
 * - `"start"` (default): popover's left edge to anchor's left edge.
 * - `"end"`: popover's right edge to anchor's right edge.
 */
export default function useAnchoredPosition(
	anchorRef: RefObject<HTMLElement | null>,
	isOpen: boolean,
	align: AnchorAlign = "start",
): AnchoredPosition | null {
	const [pos, setPos] = useState<AnchoredPosition | null>(null);

	useLayoutEffect(() => {
		if (!isOpen) {
			setPos(null);
			return;
		}
		const update = () => {
			const el = anchorRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			const spaceBelow = vh - r.bottom - VIEWPORT_MARGIN;
			const spaceAbove = r.top - VIEWPORT_MARGIN;
			const placeBelow =
				spaceBelow >= COMFORTABLE_BELOW || spaceBelow >= spaceAbove;

			const horizontal: Pick<AnchoredPosition, "left" | "right"> = {};
			if (align === "end") {
				horizontal.right = Math.max(VIEWPORT_MARGIN, vw - r.right);
			} else {
				let left = r.left;
				if (left + r.width > vw - VIEWPORT_MARGIN) {
					left = Math.max(
						VIEWPORT_MARGIN,
						vw - r.width - VIEWPORT_MARGIN,
					);
				}
				horizontal.left = left;
			}

			const maxHeight = Math.max(
				0,
				(placeBelow ? spaceBelow : spaceAbove) - GAP,
			);

			if (placeBelow) {
				setPos({
					...horizontal,
					top: r.bottom + GAP,
					width: r.width,
					maxHeight,
				});
			} else {
				setPos({
					...horizontal,
					bottom: vh - r.top + GAP,
					width: r.width,
					maxHeight,
				});
			}
		};
		update();
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update, true);
			window.removeEventListener("resize", update);
		};
	}, [isOpen, anchorRef, align]);

	return pos;
}
