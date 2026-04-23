export const normalizeUrl = (raw: string): string => {
	try {
		const u = new URL(raw);
		u.hash = "";
		u.hostname = u.hostname.toLowerCase();

		if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
			u.pathname = u.pathname.slice(0, -1);
		}
		return u.toString();
	} catch {
		return raw.trim();
	}
};
