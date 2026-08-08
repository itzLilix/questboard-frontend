/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Override the profile API base URL (defaults to the /api/profile/v1 proxy path). */
	readonly VITE_PROFILE_API_URL?: string;
	/** Override the session API base URL (defaults to the /api/sessions/v1 proxy path). */
	readonly VITE_SESSION_API_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
