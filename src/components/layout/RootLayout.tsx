import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AuthModal from "../../features/auth/AuthModal";
import ListLoading from "../ui/ListLoading";
import useAuth from "../../features/auth/AuthProvider";

export default function RootLayout() {
	// Pages mount only after auth is resolved, so their initial queries
	// always run with the final identity — no anonymous data gets cached
	// while a returning user's token refresh is still in flight.

	return (
		<div className="min-h-dvh relative">
			<AppHeader />
			<AuthModal />
			<div className="pt-(--header-h)">
				{useAuth().isLoading ? <ListLoading /> : <Outlet />}
			</div>
		</div>
	);
}
