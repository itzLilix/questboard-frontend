import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button";
import Icon from "../Icon";
import { SystemBadge } from "../SystemBadge";
import {
	MONTHS_GENITIVE,
	pluralHours,
	pluralSeats,
} from "../../../utils/words";
import type { IUserBrief } from "../../../types/userCard";
import type { ISession } from "../../../types/session";
import { CardLabel } from "./CardLine";

const DEFAULT_BADGE_COLOR = "var(--border)";

const TYPE_LABEL = {
	oneshot: "Ваншот",
	campaign: "Кампейн",
} as const;

export type SessionCardProps = {
	sessionData: ISession;
	master: IUserBrief | undefined;
	className?: string;
};

export default function SessionCard({
	sessionData,
	master,
	className,
}: SessionCardProps) {
	const navigate = useNavigate();
	const fallbackBg = sessionData.system.badgeColor || DEFAULT_BADGE_COLOR;
	const occupied = Math.max(0, sessionData.maxSeats - sessionData.freeSeats);

	return (
		<div
			className={clsx(
				"relative max-w-1/5 w-full aspect-9/12 rounded-2xl border border-(--border) overflow-hidden flex flex-col",
				className,
			)}
			style={{
				backgroundColor: fallbackBg,
			}}
		>
			{sessionData.previewUrl ? (
				<img
					src={sessionData.previewUrl}
					alt=""
					aria-hidden
					className="absolute inset-0 w-full h-full object-cover"
				/>
			) : (
				<img
					src={"src/assets/zero-card.svg"}
					alt=""
					aria-hidden
					className="absolute inset-0 w-1/3 object-contain opacity-50 top-1/8 left-1/2 transform -translate-x-1/2"
				/>
			)}
			<div
				aria-hidden
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom, rgb(from var(--bg-card) r g b / 0.4) 0%, var(--bg-card) 50%, var(--bg-card) 100%)",
				}}
			/>

			<div className="absolute top-4 left-4 z-10">
				<SystemBadge system={sessionData.system} />
			</div>

			<Link
				to={`/sessions/${sessionData.id}`}
				className="absolute inset-0 z-0"
				aria-label={sessionData.title}
			/>

			<div className="relative z-1 mt-auto flex flex-col gap-3 p-5 pointer-events-none">
				<div>
					<h3 className="font-display text-2xl text-(--text-primary)">
						{sessionData.title}
					</h3>
					{master && (
						<p className="text-lg text-(--text-secondary)">
							{"Мастер: "}
							<Link
								to={`/users/${master.username}`}
								className="text-(--text-primary) hover:text-(--accent-hover) transition-colors pointer-events-auto relative z-1"
							>
								{master.displayName}
							</Link>
						</p>
					)}
				</div>

				<ul className="flex flex-col gap-1.5 text-base text-(--text-primary)">
					<InfoRow icon="alarm">
						{TYPE_LABEL[sessionData.type]}
						{sessionData.duration
							? `, ~${formatDuration(sessionData.duration)}`
							: ""}
					</InfoRow>
					<InfoRow icon="calendar_today">
						{formatScheduledAt(sessionData.scheduledAt)}
					</InfoRow>
					{sessionData.format === "offline" ? (
						sessionData.location?.address && (
							<InfoRow icon="location_on">
								{sessionData.location.address}
							</InfoRow>
						)
					) : (
						<InfoRow icon="cloud_circle">{"Онлайн"}</InfoRow>
					)}
				</ul>

				<div className="flex items-center justify-between gap-3">
					<SeatsIndicator
						occupied={occupied}
						maxSeats={sessionData.maxSeats}
						freeSeats={sessionData.freeSeats}
					/>
					<span
						className={clsx(
							"text-base font-medium shrink-0",
							sessionData.price === 0
								? "text-(--success)"
								: "text-(--text-primary)",
						)}
					>
						{sessionData.price === 0
							? "Бесплатно"
							: `${sessionData.price} ₽`}
					</span>
				</div>

				<div className="flex gap-3 pointer-events-auto">
					<Button
						variant="secondary"
						csize="sm"
						fullWidth
						className="flex-1 relative z-1"
						onClick={() => navigate(`/sessions/${sessionData.id}`)}
					>
						Подробнее
					</Button>
					<Button
						variant="primary"
						csize="sm"
						fullWidth
						className="flex-1 relative z-1"
					>
						Записаться
					</Button>
				</div>
			</div>
		</div>
	);
}

function InfoRow({
	icon,
	children,
}: {
	icon: string;
	children: React.ReactNode;
}) {
	return (
		<li className="flex items-center gap-2 text-(--text-secondary)">
			<Icon name={icon} className="text-lg! text-(--accent)! shrink-0" />
			<span>{children}</span>
		</li>
	);
}

function SeatsIndicator({
	occupied,
	maxSeats,
	freeSeats,
}: {
	occupied: number;
	maxSeats: number;
	freeSeats: number;
}) {
	return (
		<div className="flex items-center gap-2 min-w-0">
			<div className="flex items-center gap-1 shrink-0">
				{Array.from({ length: maxSeats }).map((_, i) => (
					<span
						key={i}
						className={clsx(
							"w-4 h-4 rounded-sm",
							i < occupied
								? "bg-(--accent)"
								: "border border-(--accent)",
						)}
					/>
				))}
			</div>
			<span className="text-base text-(--text-secondary) truncate">
				{freeSeats} {pluralSeats(freeSeats)}
			</span>
		</div>
	);
}

function formatDuration(hours: number): string {
	const rounded = Math.round(hours * 2) / 2;
	const display = Number.isInteger(rounded)
		? `${rounded}`
		: rounded.toFixed(1).replace(".", ",");
	return `${display} ${pluralHours(rounded)}`;
}

function formatScheduledAt(iso: string): string {
	const date = new Date(iso);
	if (isNaN(date.getTime())) return "—";
	const day = date.getDate();
	const month = MONTHS_GENITIVE[date.getMonth()];
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const tzOffset = -date.getTimezoneOffset() / 60;
	const tz = `GMT${tzOffset >= 0 ? "+" : ""}${tzOffset}`;
	return `${day} ${month}, ${hours}:${minutes} / ${tz}`;
}
