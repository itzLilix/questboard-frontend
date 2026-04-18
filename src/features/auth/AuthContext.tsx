import { createContext, useState, type ReactNode, useEffect } from "react";
import { type IUser } from "../types/types";
import { api, refreshTokens } from "../api/axios";

const AuthContext = createContext({
	isLoading: false as boolean,
	user: null as IUser | null,
	login: (_user: IUser) => {},
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<IUser | null>(null);

	useEffect(() => {
		refreshTokens()
			.then((res) => {
				setUser(res.data);
			})
			.catch(() => {
				setUser(null);
			})
			.finally(() => setIsLoading(false));
	}, []);

	const login = (user: IUser | null) => {
		if (!user) return;
		setUser(user);
	};

	const logout = async () => {
		if (!user) return;
		try {
			await api.post("/auth/logout");
			setUser(null);
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	return (
		<AuthContext.Provider value={{ isLoading, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
