import clsx from "clsx";
import Icon from "./Icon";

export default function CloseButton({
	className,
	onClose,
}: {
	className?: string;
	onClose: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClose}
			className={clsx(
				"flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) cursor-pointer",
				className,
			)}
			//aria-label="Закрыть"
		>
			<Icon name="close" />
		</button>
	);
}
