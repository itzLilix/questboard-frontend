import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import materialSymbols from "vite-plugin-material-symbols";

// https://vite.dev/config/
export default defineConfig({
	server: {
		// Mirrors the planned production reverse proxy: the app is served from
		// one origin and /api/<service>/* is forwarded to the Go services with
		// the prefix stripped. Going live only requires replicating these two
		// routes in nginx/Caddy — no frontend changes.
		proxy: {
			"/api/profile": {
				target: "http://localhost:3000",
				rewrite: (path) => path.replace(/^\/api\/profile/, ""),
				// The refresh cookie is scoped to the backend's /v1/auth; translate
				// it into this proxy's URL space so the browser sends it back.
				// Prod equivalent: nginx `proxy_cookie_path /v1/auth /api/profile/v1/auth;`
				cookiePathRewrite: {
					"/v1/auth": "/api/profile/v1/auth",
				},
			},
			"/api/sessions": {
				target: "http://localhost:3001",
				ws: true,
				rewrite: (path) => path.replace(/^\/api\/sessions/, ""),
			},
		},
	},
	plugins: [
		react(),
		babel({ presets: [reactCompilerPreset()] }),
		tailwindcss(),
		materialSymbols({
			fontUrl:
				"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0",
			preload: true,
		}),
	],
});
