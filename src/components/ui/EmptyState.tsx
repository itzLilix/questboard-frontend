export default function EmptyState({ text }: { text: string }) {
	return (
		<div className="flex justify-center py-12 text-(--text-secondary) text-base">
			{text}
		</div>
	);
}
