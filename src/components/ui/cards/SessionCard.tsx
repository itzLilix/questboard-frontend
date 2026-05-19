import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button";
import Icon from "../Icon";
import { SystemBadge } from "../SystemBadge";
import type { ISessionCard } from "../../../types/session";
import {
	MONTHS_GENITIVE,
	pluralHours,
	pluralSeats,
} from "../../../utils/words";

const DEFAULT_BADGE_COLOR = "var(--border)";

const TYPE_LABEL = {
	oneshot: "Ваншот",
	campaign: "Кампейн",
} as const;

export type SessionCardProps = {
	sessionData: ISessionCard;
	className?: string;
};

export default function SessionCard({
	sessionData,
	className,
}: SessionCardProps) {
	const {
		id,
		title,
		previewUrl,
		system,
		type,
		duration,
		scheduledAt,
		format,
		location,
		maxSeats,
		freeSeats,
		price,
		masterDisplayName,
	} = sessionData;

	const navigate = useNavigate();
	const fallbackBg = system.badgeColor || DEFAULT_BADGE_COLOR;
	const occupied = Math.max(0, maxSeats - freeSeats);

	return (
		<div
			className={clsx(
				"relative max-w-1/5 w-full aspect-9/11 rounded-2xl border border-(--border) overflow-hidden flex flex-col",
				className,
			)}
			style={{ backgroundColor: fallbackBg }}
		>
			{previewUrl && (
				<img
					src={previewUrl}
					alt=""
					aria-hidden
					className="absolute inset-0 w-full h-full object-cover"
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
				<SystemBadge system={system} />
			</div>

			<Link
				to={`/sessions/${id}`}
				className="absolute inset-0 z-0"
				aria-label={title}
			/>

			<div className="relative z-1 mt-auto flex flex-col gap-3 p-5 pointer-events-none">
				<div>
					<h3 className="font-display text-2xl text-(--text-primary)">
						{title}
					</h3>
					{masterDisplayName && (
						<p className="text-base text-(--text-secondary)">
							Мастер:{" "}
							<Link
								to={`/users/${masterDisplayName}`}
								className="text-(--text-primary) hover:text-(--accent-hover) transition-colors pointer-events-auto relative z-1"
							>
								{masterDisplayName}
							</Link>
						</p>
					)}
				</div>

				<ul className="flex flex-col gap-1.5 text-base text-(--text-primary)">
					<InfoRow icon="alarm">
						{TYPE_LABEL[type]}
						{duration ? `, ~${formatDuration(duration)}` : ""}
					</InfoRow>
					<InfoRow icon="calendar_today">
						{formatScheduledAt(scheduledAt)}
					</InfoRow>
					{format === "offline" ? (
						location?.address && (
							<InfoRow icon="location_on">
								{location.address}
							</InfoRow>
						)
					) : (
						<InfoRow icon="cloud_circle">{"Онлайн"}</InfoRow>
					)}
				</ul>

				<div className="flex items-center justify-between gap-3">
					<SeatsIndicator
						occupied={occupied}
						maxSeats={maxSeats}
						freeSeats={freeSeats}
					/>
					<span
						className={clsx(
							"text-base font-medium shrink-0",
							price === 0
								? "text-(--success)"
								: "text-(--text-primary)",
						)}
					>
						{price === 0 ? "Бесплатно" : `${price} ₽`}
					</span>
				</div>

				<div className="flex gap-3 pointer-events-auto">
					<Button
						variant="secondary"
						csize="sm"
						fullWidth
						className="flex-1 relative z-1"
						onClick={() => navigate(`/sessions/${id}`)}
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
