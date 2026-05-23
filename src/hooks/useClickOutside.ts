import { useEffect, type RefObject } from "react";

export default function useClickOutside(
	ref: RefObject<HTMLElement | null>,
	isActive: boolean,
	onClickOutside: () => void,
	extraRef?: RefObject<HTMLElement | null>,
) {
	useEffect(() => {
		if (!isActive) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const inMain = ref.current?.contains(target);
			const inExtra = extraRef?.current?.contains(target);
			if (!inMain && !inExtra) {
				onClickOutside();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [isActive, ref, onClickOutside, extraRef]);
}
