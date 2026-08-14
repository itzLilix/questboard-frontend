import SessionCardCompact from "../../../components/ui/cards/SessionCompact";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";
import ListLoading from "../../../components/ui/ListLoading";
import type { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import type { CampaignRef, ISession } from "../../../types/session";

export function SessionList({
	title,
	sessions,
	sentinelRef,
	isFetchingNextPage,
	campaigns,
	isUpcoming = false,
}: {
	title: string;
	sessions: ISession[];
	sentinelRef: ReturnType<typeof useInfiniteScroll>;
	isFetchingNextPage: boolean;
	campaigns?: Record<string, CampaignRef>;
	isUpcoming?: boolean;
}) {
	if (sessions.length === 0) return null;
	return (
		<CollapsibleSection title={title}>
			{sessions.map((session) => (
				<SessionCardCompact
					key={session.id}
					sessionData={session}
					isUpcoming={isUpcoming}
					campaignRef={campaigns?.[session.id]}
				/>
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage && <ListLoading />}
		</CollapsibleSection>
	);
}
