import clsx from "clsx";

export default function EmptyState({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<div
			className={clsx(
				"flex justify-center py-12 text-(--text-secondary) text-base",
				className,
			)}
		>
			{text}
		</div>
	);
}
