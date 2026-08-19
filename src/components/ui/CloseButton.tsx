import clsx from "clsx";
import Icon from "./Icon";
import type { ButtonHTMLAttributes } from "react";

type CloseButtonProps = {
	className?: string;
	onClose: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function CloseButton({
	className,
	disabled,
	"aria-label": ariaLabel,
	title,
	onClose,
}: CloseButtonProps) {
	return (
		<button
			type="button"
			onClick={onClose}
			className={clsx(
				"flex items-center justify-center text-(--text-muted) hover:text-(--text-primary) cursor-pointer",
				className,
			)}
			aria-label={ariaLabel ?? "Закрыть"}
			disabled={disabled}
			title={title ?? "Закрыть"}
		>
			<Icon name="close" />
		</button>
	);
}
