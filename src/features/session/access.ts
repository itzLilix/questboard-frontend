import { SessionMembership, type SessionResponse } from "../../types/session";
import { type IUser, UserRole } from "../../types/user";

export const AccessLevel = {
	None: 0,
	View: 10,
	Access: 20,
	Edit: 30,
} as const;
export type AccessLevel = (typeof AccessLevel)[keyof typeof AccessLevel];

export const SessionRelation = {
	...SessionMembership,
	Viewer: "viewer",
};
export type SessionRelation =
	(typeof SessionRelation)[keyof typeof SessionRelation];

const RELATION_LEVEL: Record<SessionRelation, AccessLevel> = {
	[SessionRelation.Viewer]: AccessLevel.View,
	[SessionRelation.Left]: AccessLevel.View,
	[SessionRelation.Applicant]: AccessLevel.View,
	[SessionRelation.Player]: AccessLevel.Access,
	[SessionRelation.Master]: AccessLevel.Edit,
	[SessionRelation.Kicked]: AccessLevel.None,
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
		return this.in([SessionRelation.Player, SessionRelation.Master]);
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
	const relation = (sessionData.membership ||
		SessionRelation.Viewer) as SessionRelation;
	return new SessionRole(relation, isAdmin);
}
