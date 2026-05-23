import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
import Icon from "../Icon";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	className?: string;
	children: ReactNode;
};

export default function FilterModal({
	isOpen,
	onClose,
	title = "Фильтры",
	className,
	children,
}: Props) {
	useEffect(() => {
		if (!isOpen) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/20 z-10" onClick={onClose} />
			<div
				className={clsx(
					"fixed inset-0 m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[90vh] h-fit bg-(--bg-base-tp) backdrop-blur-lg rounded-2xl border border-(--border) z-20 animate-fade-in flex flex-col",
					className,
				)}
				role="dialog"
				aria-modal="true"
				aria-label={title}
			>
				<div className="flex items-center justify-between px-6 pt-6 pb-4">
					<h2 className="text-2xl font-display text-(--text-primary)">
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1 inline-flex items-center justify-center rounded-full text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors cursor-pointer"
						aria-label="Закрыть"
					>
						<Icon name="close" />
					</button>
				</div>

				<div className="flex flex-col gap-5 px-6 pb-6 overflow-y-auto">
					{children}
				</div>
			</div>
		</>
	);
}

export function FilterSection({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-sm uppercase font-body text-(--text-muted) tracking-wide">
				{label}
			</span>
			<div>{children}</div>
		</div>
	);
}
