import clsx from "clsx";
import {
	SessionFormat,
	type CampaignRef,
	type ISession,
} from "../../../types/session";
import TextSeparator from "../TextSeparator";
import { splitDatetime } from "../../../utils/dateFormats";
import { FORMAT_LABEL } from "../../../utils/words";
import { SystemBadge } from "../SystemBadge";
import { Link } from "react-router-dom";

export type SessionCardProps = {
	sessionData: ISession;
	className?: string;
	isUpcoming?: boolean;
	campaignRef?: CampaignRef;
};

export default function SessionCardCompact({
	sessionData,
	className,
	isUpcoming = false,
	campaignRef,
}: SessionCardProps) {
	const { date, time } = splitDatetime(sessionData.scheduledAt, false);
	return (
		<Link
			className={clsx(
				"rounded-2xl bg-(--bg-surface) border flex p-4 items-center font-body text-base text-(--text-secondary)",
				isUpcoming ? "border-(--accent)" : "border-(--border)",
				className,
			)}
			to={`/sessions/${sessionData.id}`}
		>
			<div className="flex flex-col gap-1">
				<div className="inline-flex items-baseline gap-3">
					<h3 className="font-display text-xl text-(--text-primary)">
						{sessionData.title}
					</h3>
					{campaignRef && (
						<h4 className="text-(--text-secondary)">
							{"#" +
								campaignRef.index +
								" в " +
								campaignRef.title}
						</h4>
					)}
				</div>
				<span>
					<span>{date}</span>
					<TextSeparator />
					<span>{time}</span>
					<TextSeparator />
					<span>
						{sessionData.format === SessionFormat.Online
							? FORMAT_LABEL[SessionFormat.Online]
							: (sessionData.location?.address ??
								"Адрес не указан")}
					</span>
				</span>
			</div>
			<div className="flex gap-2 ml-auto">
				<SystemBadge system={sessionData.system} />
				<span>
					{sessionData.maxSeats -
						sessionData.freeSeats +
						"/" +
						sessionData.maxSeats}
				</span>
			</div>
		</Link>
	);
}
