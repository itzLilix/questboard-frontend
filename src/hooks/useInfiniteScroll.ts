import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function useInfiniteScroll(query: {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
}) {
	const { ref, inView } = useInView({ rootMargin: "300px 0px" });
	const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
	return ref;
}
