import axios, { type AxiosResponse } from "axios";

export const profileApi = axios.create({
	baseURL: "http://localhost:3000",
	withCredentials: true,
});

export const sessionApi = axios.create({
	baseURL: "http://localhost:3001",
	withCredentials: true,
});

let refreshPromise: Promise<AxiosResponse> | null = null;

export function refreshTokens() {
	if (!refreshPromise) {
		refreshPromise = profileApi.get("/auth/refresh").finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

function attach401Interceptor(instance: ReturnType<typeof axios.create>) {
	instance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;
			const skipRefresh = ["/auth/login", "/auth/signup", "/auth/refresh"];

			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!skipRefresh.includes(originalRequest.url)
			) {
				originalRequest._retry = true;
				try {
					await refreshTokens();
					return instance(originalRequest);
				} catch {
					return Promise.reject(error);
				}
			}

			return Promise.reject(error);
		},
	);
}

attach401Interceptor(profileApi);
attach401Interceptor(sessionApi);
