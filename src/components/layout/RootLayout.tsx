import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AuthModal from "../../features/auth/AuthModal";

export default function RootLayout() {
	return (
		<div className="min-h-dvh relative">
			<AppHeader />
			<AuthModal />
			<div className="pt-(--header-h)">
				<Outlet />
			</div>
		</div>
	);
}
