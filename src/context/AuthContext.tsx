import { createContext, useState, type ReactNode, useEffect } from "react";
import { type IUser } from "../types/types";
import { api } from "../api/axios";
import { getCookie } from "../utils/cookie";

const AuthContext = createContext({
	isLoading: false as boolean,
	user: null as IUser | null,
	login: (user: IUser) => {},
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<IUser | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem("user");
		const exp = getCookie("access_token_exp");

		if (!stored || !exp) {
			setIsLoading(false);
			return;
		}

		if (Date.now() / 1000 > Number(exp) - 30) {
			api.get("/auth/refresh")
				.then((r) => {
					setUser(r.data);
					localStorage.setItem("user", JSON.stringify(r.data));
				})
				.catch(() => {
					setUser(null);
					localStorage.removeItem("user");
				})
				.finally(() => setIsLoading(false));
		} else {
			setUser(JSON.parse(stored));
			setIsLoading(false);
		}
	}, []);

	const login = (user: IUser | null) => {
		if (!user) return;
		setUser(user);
		localStorage.setItem("user", JSON.stringify(user));
	};

	const logout = async () => {
		if (!user) return;
		try {
			await api.post("/auth/logout");
			setUser(null);
			localStorage.removeItem("user");
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
