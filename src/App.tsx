import { Routes, Route, Navigate } from "react-router-dom";
import AppHeader from "./components/layout/AppHeader";
import AuthModal from "./components/layout/AuthModal";
import ProfilePage from "./pages/ProfilePage";
import SettingsLayout from "./components/layout/SettingsLayout";
import RequireAuth from "./components/layout/RequireAuth";
import NotificationSettings from "./pages/Settings/NotificationSettings";
import SecuritySettings from "./pages/Settings/SecuritySettings";
import ProfileSettings from "./pages/Settings/ProfileSettings";
import GeneralSettings from "./pages/Settings/GeneralSettings";

function App() {
	return (
		<div className="min-h-screen">
			<AppHeader />
			<AuthModal />
			<Routes>
				<Route path="/users/:username" element={<ProfilePage />} />
				<Route element={<RequireAuth />}>
					<Route path="/settings" element={<SettingsLayout />}>
						<Route
							index
							element={<Navigate to="general" replace />}
						/>
						<Route path="general" element={<GeneralSettings />} />
						<Route path="profile" element={<ProfileSettings />} />
						<Route path="security" element={<SecuritySettings />} />
						<Route
							path="notifications"
							element={<NotificationSettings />}
						/>
					</Route>
				</Route>
			</Routes>
		</div>
	);
}

export default App;
