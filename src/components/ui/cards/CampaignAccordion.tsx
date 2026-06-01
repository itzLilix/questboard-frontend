import { useState } from "react";
import clsx from "clsx";
import type { ICampaign } from "../../../types/campaign";
import { SystemBadge } from "../SystemBadge";
import Icon from "../Icon";
import Loading from "../Loading";
import SessionCardCompact from "./SessionCompact";
import { useCampaignSessionsQuery } from "../../../features/session/queries";
import { CAMPAIGN_STATUS_LABEL, pluralPartiy } from "../../../utils/words";

export type CampaignAccordionProps = {
	campaign: ICampaign;
	className?: string;
	defaultOpen?: boolean;
};

export default function CampaignAccordion({
	campaign,
	className,
	defaultOpen = false,
}: CampaignAccordionProps) {
	const [open, setOpen] = useState(defaultOpen);
	const { data: sessions, isLoading } = useCampaignSessionsQuery(campaign.id, {
		enabled: open,
	});

	return (
		<div
			className={clsx(
				"rounded-2xl bg-(--bg-card) border border-(--border) overflow-hidden",
				className,
			)}
		>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
			>
				<div className="flex flex-col gap-1 min-w-0">
					<h3 className="font-display text-xl text-(--text-primary) truncate">
						{campaign.title}
					</h3>
					<span className="font-body text-base text-(--text-secondary)">
						{campaign.sessionCount}{" "}
						{pluralPartiy(campaign.sessionCount)}
						{", "}
						{CAMPAIGN_STATUS_LABEL[campaign.status]}
					</span>
				</div>
				<div className="flex items-center gap-3 ml-auto shrink-0">
					{campaign.system && <SystemBadge system={campaign.system} />}
					<Icon
						name="keyboard_arrow_down"
						className={clsx(
							"text-(--accent)! transition-transform",
							open && "rotate-180",
						)}
					/>
				</div>
			</button>

			{open && (
				<div className="flex flex-col gap-2 p-4 pt-0">
					{isLoading ? (
						<div className="flex justify-center py-6">
							<Loading />
						</div>
					) : (
						sessions?.map((session) => (
							<SessionCardCompact
								key={session.id}
								sessionData={session}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
}
