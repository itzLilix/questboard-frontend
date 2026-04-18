export default function BannerImage({
	src,
	size = "full",
}: {
	src: string | undefined;
	size: "full" | "small";
}) {
	if (!src) return null;

	const sizeClasses = {
		full: "w-full h-44",
		small: "w-128 h-24",
	};

	return (
		<div
			className={`${sizeClasses[size]} bg-center bg-cover rounded-2xl`}
			style={{ backgroundImage: `url(${src})` }}
		></div>
	);
}
