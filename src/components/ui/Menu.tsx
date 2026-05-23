import clsx from "clsx";
import {
	useCallback,
	useEffect,
	useRef,
	type ButtonHTMLAttributes,
	type ReactNode,
	type RefObject,
} from "react";
import { createPortal } from "react-dom";
import useAnchoredPosition, {
	type AnchorAlign,
} from "../../hooks/useAnchoredPosition";
import useClickOutside from "../../hooks/useClickOutside";

type MenuProps = {
	isOpen: boolean;
	onClose: () => void;
	triggerRef: RefObject<HTMLElement | null>;
	align?: AnchorAlign;
	className?: string;
	children: ReactNode;
};

export default function Menu({
	isOpen,
	onClose,
	triggerRef,
	align = "start",
	className,
	children,
}: MenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const close = useCallback(() => onClose(), [onClose]);

	useClickOutside(triggerRef, isOpen, close, menuRef);
	const pos = useAnchoredPosition(triggerRef, isOpen, align);

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen || !pos) return null;

	return createPortal(
		<div
			ref={menuRef}
			role="menu"
			className={clsx(
				"fixed z-101 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 min-w-48 overflow-y-auto",
				className,
			)}
			style={{
				top: pos.top,
				bottom: pos.bottom,
				left: pos.left,
				right: pos.right,
				maxHeight: pos.maxHeight,
			}}
		>
			{children}
		</div>,
		document.body,
	);
}

type MenuItemProps = {
	children: ReactNode;
	onClick: () => void;
	before?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function MenuItem({
	children,
	onClick,
	before,
	...props
}: MenuItemProps) {
	return (
		<button
			className="text-base font-body font-(--text-primary) rounded-xl cursor-pointer hover:bg-(--bg-elevated) px-3 py-2 flex items-center gap-2 w-full text-left disabled:opacity-50 disabled:pointer-events-none"
			onClick={onClick}
			{...props}
		>
			{before && (
				<span className="shrink-0 flex items-center">{before}</span>
			)}
			<span className="grow">{children}</span>
		</button>
	);
}

export function MenuDivider() {
	return <div className="border-t border-(--border) my-1 w-full" />;
}
