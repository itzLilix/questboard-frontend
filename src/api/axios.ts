import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const api = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const skipRefresh = [
			"/auth/me",
			"/auth/login",
			"/auth/signup",
			"/auth/refresh",
		];

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!skipRefresh.includes(originalRequest.url)
		) {
			originalRequest._retry = true;
			try {
				await api.get("/auth/refresh");
				return api(originalRequest);
			} catch {
				return Promise.reject(error);
			}
		}

		return Promise.reject(error);
	},
);
