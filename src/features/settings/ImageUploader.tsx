import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";

type ImageUploaderProps = {
	currentUrl?: string | null;
	file: File | null;
	onChange: (file: File | null) => void;
	variant: "avatar" | "banner";
	maxSizeMB?: number;
};

const variantClasses = {
	avatar: "w-24 h-24 rounded-full",
	banner: "w-128 h-24 rounded-lg",
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
	currentUrl,
	file,
	onChange,
	variant,
	maxSizeMB = 5,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const preview = useMemo(
		() => (file ? URL.createObjectURL(file) : null),
		[file],
	);

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	const displayUrl = preview ?? currentUrl;
	const hasImage = Boolean(displayUrl);

	const handleFile = (selected?: File) => {
		if (!selected) return;
		if (!selected.type.startsWith("image/")) return;
		if (selected.size > maxSizeMB * 1024 * 1024) return;

		onChange(selected);
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setIsDragging(false);
					handleFile(e.dataTransfer.files[0]);
				}}
				className={`${isDragging ? "ring-2 ring-(--accent)" : ""} ${variantClasses[variant]} border border-(--border) bg-center bg-cover flex items-center justify-center text-(--text-secondary)`}
				style={
					hasImage
						? { backgroundImage: `url(${displayUrl})` }
						: undefined
				}
			>
				{!hasImage && (
					<Icon name={variant === "avatar" ? "person" : "image"} />
				)}
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						handleFile(e.target.files?.[0]);
						e.target.value = "";
					}}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Button
					variant="secondary"
					csize="sm"
					onClick={() => inputRef.current?.click()}
				>
					Изменить
				</Button>

				<Button
					variant="secondary"
					csize="sm"
					onClick={() => onChange(null)}
					disabled={!currentUrl}
				>
					Удалить
				</Button>
			</div>
		</div>
	);
};

export default ImageUploader;
