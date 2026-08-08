import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button";
import Icon from "../Icon";
import { SystemBadge } from "../SystemBadge";
import { pluralHours, pluralSeats, TYPE_LABEL } from "../../../utils/words";
import type { IUserBrief } from "../../../types/userCard";
import {
	SessionAvailability,
	SessionFormat,
	SessionMembership,
	type ISession,
} from "../../../types/session";
import { useAuthModal } from "../../../features/auth/authModalStore";
import { formatDatetime } from "../../../utils/dateFormats";
import { useJoinSessionMutation } from "../../../features/session/queries";
import useAuth from "../../../features/auth/AuthProvider";

const DEFAULT_BADGE_COLOR = "var(--border)";

export type SessionCardProps = {
	sessionData: ISession;
	master: IUserBrief | undefined;
	className?: string;
	membership?: SessionMembership;
};

export default function SessionCard({
	sessionData,
	master,
	className,
	membership,
}: SessionCardProps) {
	const navigate = useNavigate();
	const fallbackBg = sessionData.system.badgeColor || DEFAULT_BADGE_COLOR;
	const occupied = Math.max(0, sessionData.maxSeats - sessionData.freeSeats);
	//const authUser = null;
	//const authLoading = false;
	const { user: authUser, isLoading: authLoading } = useAuth();

	return (
		<div
			className={clsx(
				"relative aspect-9/12 rounded-2xl border border-(--border) overflow-hidden flex flex-col min-w-2xs bg-(--bg-card)",
				className,
			)}
		>
			<div
				className="absolute inset-0 bottom-1/2"
				style={{ backgroundColor: fallbackBg }}
			/>
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

			<div className="absolute top-4 left-4 z-1">
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
						{formatDatetime(sessionData.scheduledAt)}
					</InfoRow>
					{sessionData.format === SessionFormat.Offline ? (
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
					<Price price={sessionData.price} />
				</div>

				<div className="grid grid-cols-2 gap-3 pointer-events-auto">
					<Button
						variant="secondary"
						csize="sm"
						className="flex-1 relative z-1"
						onClick={() => navigate(`/sessions/${sessionData.id}`)}
					>
						Подробнее
					</Button>
					<ApplyButton
						availability={sessionData.availability}
						disabled={
							authLoading || occupied >= sessionData.maxSeats
						}
						isAutenticated={!!authUser}
						membership={membership}
						sessionId={sessionData.id}
					/>
				</div>
			</div>
		</div>
	);
}

export function Price({ price }: { price: number | null }) {
	if (price === null) return null;
	return (
		<span
			className={clsx(
				"text-base font-medium shrink-0",
				price === 0 ? "text-(--success)" : "text-(--text-primary)",
			)}
		>
			{price === 0 ? "Бесплатно" : `${price} ₽`}
		</span>
	);
}

export function ApplyButton({
	availability,
	disabled,
	isAutenticated,
	membership,
	sessionId,
}: {
	availability: SessionAvailability;
	disabled: boolean;
	isAutenticated: boolean;
	membership?: SessionMembership;
	sessionId: string;
}) {
	const { open: openAuthModal } = useAuthModal();
	const join = useJoinSessionMutation();

	if (
		membership === SessionMembership.Player ||
		membership === SessionMembership.Master
	) {
		return (
			<Button
				variant="secondary"
				csize="sm"
				className="flex-1 relative z-1 text-(--success)!"
				disabled={true}
			>
				<Icon name="check" className="text-sm!" /> Участник
			</Button>
		);
	}
	if (availability === SessionAvailability.Application) {
		return (
			<Button
				variant="primary"
				csize="sm"
				className="flex-1 relative z-1"
				disabled={disabled}
				onClick={() => {
					if (!isAutenticated) {
						openAuthModal("login");
						return;
					}
					// apply
				}}
			>
				Заявка
			</Button>
		);
	}

	return (
		<Button
			variant="primary"
			csize="sm"
			fullWidth
			className="flex-1 relative z-1"
			disabled={disabled}
			onClick={() => {
				if (!isAutenticated) {
					openAuthModal("login");
					return;
				}

				console.log("click");
				join.mutate(sessionId);
			}}
		>
			Вступить
		</Button>
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
	const full = occupied === maxSeats;
	return (
		<div className="flex items-center gap-2 min-w-0">
			{maxSeats <= 6 && (
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
			)}
			{full ? (
				<span className="text-base text-(--error)">Нет мест</span>
			) : (
				<span className="text-base text-(--text-secondary) truncate">
					{freeSeats} {pluralSeats(freeSeats)}
				</span>
			)}
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
