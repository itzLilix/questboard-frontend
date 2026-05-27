import clsx from "clsx";
import { SessionFormat, type ISession } from "../../../types/session";
import type { IUserBrief } from "../../../types/userCard";
import TextSeparator from "../TextSeparator";
import { splitDatetime } from "../../../utils/dateFormats";
import { FORMAT_LABEL } from "../../../utils/words";
import { SystemBadge } from "../SystemBadge";

export type SessionCardProps = {
	sessionData: ISession;
	master: IUserBrief | undefined;
	className?: string;
	isUpcoming?: boolean;
};

export default function SessionCardCompact({
	sessionData,
	master,
	className,
	isUpcoming = false,
}: SessionCardProps) {
	const { date, time } = splitDatetime(sessionData.scheduledAt, false);
	return (
		<div
			className={clsx(
				"rounded-2xl bg-(--bg-surface) border flex p-4 items-center font-body text-base text-(--text-secondary)",
				isUpcoming ? "border-(--accent)" : "border-(--border)",
			)}
		>
			<div className="flex flex-col gap-1">
				<h3 className="font-display text-xl text-(--text-primary)">
					{sessionData.title}
				</h3>
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
					{sessionData.freeSeats + "/" + sessionData.maxSeats}
				</span>
			</div>
		</div>
	);
}
