export default function BannerImage({ src }: { src: string | undefined }) {
	if (!src) return null;

	return (
		<div
			className="w-full h-44 bg-center bg-cover rounded-2xl"
			style={{ backgroundImage: `url(${src})` }}
		></div>
	);
}
