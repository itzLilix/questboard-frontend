import Icon from "./Icon";

export default function Rating({
	rating,
	reviewsCount,
}: {
	rating: number;
	reviewsCount: number;
}) {
	if (rating === 0) return <span>Нет рейтинга</span>;
	return (
		<span className="flex items-center gap-1 text-base text-(--text-secondary) font-body">
			<Icon name="star" className="text-base! text-(--accent)!" />
			{rating.toFixed(1)} ({reviewsCount})
		</span>
	);
}
