export default function OrDivider({ className }: { className?: string }) {
	return (
		<div className={`flex items-center gap-4 mx-24 ${className || ""}`}>
			<div className="flex-1 border-t border-(--accent)" />
			<span className="text-base font-body text-(--accent)">или</span>
			<div className="flex-1 border-t border-(--accent)" />
		</div>
	);
}
