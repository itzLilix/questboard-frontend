export default function AvatarImage({
	src,
	alt,
	size = "sm",
}: {
	src?: string;
	alt: string;
	size: "sm" | "md" | "lg" | "xl";
}) {
	const sizeClasses = {
		sm: "w-6 h-6 text-sm",
		md: "w-10 h-10 text-xl",
		lg: "w-16 h-16 text-3xl",
		xl: "w-24 h-24 text-4xl",
	};

	return (
		<>
			{src ? (
				<img
					src={src}
					alt={alt}
					className={`${sizeClasses[size]} rounded-full`}
				/>
			) : (
				<div
					className={`${sizeClasses[size]} rounded-full bg-(--accent) flex items-center justify-center`}
				>
					{alt[0].toUpperCase()}
				</div>
			)}
		</>
	);
}
