import { useContext } from "react";
import AuthModalContext from "./AuthModalContext";

export default function useAuthModal() {
	const ctx = useContext(AuthModalContext);
	if (!ctx)
		throw new Error("useAuthModal must be used within AuthModalProvider");
	return ctx;
}
