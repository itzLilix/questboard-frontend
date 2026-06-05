import { PlayerStatus, type SessionResponse } from "../../types/session";
import { type IUser, UserRole } from "../../types/user";

export const AccessLevel = {
	None: 0,
	View: 10,
	Access: 20,
	Edit: 30,
} as const;
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

export const SessionRelation = {
	Viewer: "viewer",
	Player: "player",
	GM: "gm",
} as const;
export type SessionRelation =
	(typeof SessionRelation)[keyof typeof SessionRelation];

const ACTIVE_STATUSES: PlayerStatus[] = [PlayerStatus.Active];

const RELATION_LEVEL: Record<SessionRelation, AccessLevel> = {
	[SessionRelation.Viewer]: AccessLevel.View,
	[SessionRelation.Player]: AccessLevel.Access,
	[SessionRelation.GM]: AccessLevel.Edit,
};

export class SessionRole {
	readonly relation: SessionRelation;
	readonly isAdmin: boolean;

	constructor(relation: SessionRelation, isAdmin: boolean) {
		this.relation = relation;
		this.isAdmin = isAdmin;
	}

	get level(): AccessLevel {
		return RELATION_LEVEL[this.relation];
	}

	can(required: AccessLevel, canAsAdmin?: boolean): boolean {
		return canAsAdmin
			? this.isAdmin || this.level >= required
			: this.level >= required;
	}

	is(relation: SessionRelation): boolean {
		return this.relation === relation;
	}

	in(relations: SessionRelation[]) {
		return relations.includes(this.relation);
	}

	isParticipant(): boolean {
		return this.in([SessionRelation.Player, SessionRelation.GM]);
	}
}

export function roleFor(
	user: IUser | null,
	sessionData: SessionResponse,
): SessionRole {
	if (!user) {
		return new SessionRole(SessionRelation.Viewer, false);
	}
	const isAdmin = user.role === UserRole.Admin;
	if (sessionData.session.masterId === user.id) {
		return new SessionRole(SessionRelation.GM, isAdmin);
	}
	if (sessionData.players.some(isActiveParticipant(user.id))) {
		return new SessionRole(SessionRelation.Player, isAdmin);
	}
	return new SessionRole(SessionRelation.Viewer, isAdmin);
}

const isActiveParticipant =
	(userId: string) => (p: SessionResponse["players"][number]) =>
		p.playerId === userId && ACTIVE_STATUSES.includes(p.status);
