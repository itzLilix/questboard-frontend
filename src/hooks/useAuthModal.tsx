import { useContext } from "react";
import AuthModalContext from "../context/AuthModalContext";

export default function useAuthModal() {
	return useContext(AuthModalContext);
}
