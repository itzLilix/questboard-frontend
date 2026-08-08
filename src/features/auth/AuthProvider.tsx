import { createContext, useContext, type ReactNode } from "react";
import { useCurrentUser } from "./queries";
import type { IUser } from "../../types/user";

type AuthContextValue = { user: IUser | null; isLoading: boolean };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: user, isLoading } = useCurrentUser();
	return (
		<AuthContext.Provider value={{ user: user ?? null, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export default function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
