import axios, { type AxiosResponse } from "axios";

// Defaults assume a reverse proxy (Vite dev proxy now, nginx/Caddy in prod)
// mapping /api/<service>/* onto the service roots. Set the env vars to hit
// the services directly (e.g. VITE_PROFILE_API_URL=http://localhost:3000/v1).
export const profileApi = axios.create({
	baseURL: import.meta.env.VITE_PROFILE_API_URL ?? "/api/profile/v1",
	withCredentials: true,
});

export const sessionApi = axios.create({
	baseURL: import.meta.env.VITE_SESSION_API_URL ?? "/api/sessions/v1",
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
		refreshPromise = profileApi.post("/auth/refresh").finally(() => {
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
				} catch {
					// Refresh failed and the server cleared the dead cookies.
					// Fall through and retry anonymously: Optional endpoints
					// succeed, Protected endpoints 401 into the login flow.
				}
				return instance(originalRequest);
			}

			return Promise.reject(error);
		},
	);
}

attach401Interceptor(profileApi);
attach401Interceptor(sessionApi);
