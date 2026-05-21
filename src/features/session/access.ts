import { PlayerStatus, type SessionResponse } from "../../types/session";
import { type IUser, UserRole } from "../../types/user";

export const AccessLevel = {
	None: 0,
	View: 10,
	Access: 20,
	Edit: 30,
} as const;
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

const ACTIVE_STATUSES: PlayerStatus[] = [PlayerStatus.Active];

export class SessionRole {
	readonly key: string;
	readonly level: AccessLevel;

	constructor(key: string, level: AccessLevel) {
		this.key = key;
		this.level = level;
	}

	can(required: AccessLevel): boolean {
		return this.level >= required;
	}

	is(role: SessionRole): boolean {
		return this.key === role.key;
	}
}

export function roleFor(
	user: IUser | null,
	sessionData: SessionResponse,
): SessionRole {
	if (!user) {
		return SESSION_ROLES.viewer;
	}
	if (user.role === UserRole.Admin) {
		return SESSION_ROLES.admin;
	}
	if (sessionData.session.masterId === user.id) {
		return SESSION_ROLES.gm;
	}
	if (sessionData.players.some(isActiveParticipant(user.id))) {
		return SESSION_ROLES.player;
	}
	return SESSION_ROLES.viewer;
}

const isActiveParticipant =
	(userId: string) => (p: SessionResponse["players"][number]) =>
		p.playerId === userId && ACTIVE_STATUSES.includes(p.status);

export const SESSION_ROLES = {
	banned: new SessionRole("banned", AccessLevel.None),
	viewer: new SessionRole("viewer", AccessLevel.View),
	player: new SessionRole("player", AccessLevel.Access),
	gm: new SessionRole("gm", AccessLevel.Edit),
	admin: new SessionRole("admin", AccessLevel.Edit),
} as const;

export type SessionRoleKey = keyof typeof SESSION_ROLES;
