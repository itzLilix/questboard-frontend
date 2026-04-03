import { createContext, useState, type ReactNode, useEffect } from "react";
import { type IUser } from "../types/types";
import { api } from "../api/axios";

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
		api.get("/auth/me")
			.then((response) => {
				setUser(response.data);
			})
			.catch(async (error) => {
				if (error.response?.status === 401) {
					try {
						await api.get("/auth/refresh");
						const response = await api.get("/auth/me");
						setUser(response.data);
					} catch {
						setUser(null);
					}
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const login = (user: IUser | null) => {
		if (!user) {
			console.warn("Login called with invalid user:", user);
			return;
		}
		setUser(user);
	};

	const logout = () => {
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ isLoading, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
