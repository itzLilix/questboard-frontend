export default function InputLabel({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<span className="text-base text-(--text-primary)">{children}</span>
	);
}
