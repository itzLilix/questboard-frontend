import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AuthModal from "../../features/auth/AuthModal";

export default function RootLayout() {
	return (
		<div className="h-dvh flex flex-col">
			<AppHeader />
			<AuthModal />
			<div className="flex-1 flex flex-col min-h-0">
				<Outlet />
			</div>
		</div>
	);
}
