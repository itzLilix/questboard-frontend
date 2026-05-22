import { createContext, useContext, type ReactNode } from "react";
import type { SessionRole } from "./access";
import type { SessionResponse } from "../../types/session";

interface SessionContextType {
	role: SessionRole;
	sessionData: SessionResponse;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({
	children,
	role,
	sessionData,
}: {
	children: ReactNode;
	role: SessionRole;
	sessionData: SessionResponse;
}) {
	return (
		<SessionContext.Provider value={{ role, sessionData }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSessionRole() {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSessionRole must be used within SessionProvider");
	}
	return context;
}
