import axios, { type AxiosResponse } from "axios";

export const profileApi = axios.create({
	baseURL: "http://localhost:3000/v1",
	withCredentials: true,
});

export const sessionApi = axios.create({
	baseURL: "http://localhost:3001/v1",
	withCredentials: true,
	paramsSerializer: (params) => {
		const sp = new URLSearchParams();
		for (const [k, v] of Object.entries(params)) {
			if (v === undefined || v === null) continue;
			if (Array.isArray(v)) {
				v.forEach((item) => sp.append(k, String(item)));
			} else {
				sp.append(k, String(v));
			}
		}
		return sp.toString();
	},
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
			const skipRefresh = [
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
