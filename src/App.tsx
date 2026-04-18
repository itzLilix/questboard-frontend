import { Routes, Route, Navigate } from "react-router-dom";
import AppHeader from "./components/layout/AppHeader";
import AuthModal from "./features/auth/AuthModal";
import ProfilePage from "./features/profile/ProfilePage";
import SettingsLayout from "./components/layout/SettingsLayout";
import RequireAuth from "./features/auth/RequireAuth";
import NotificationSettings from "./features/settings/NotificationSettings";
import SecuritySettings from "./features/settings/SecuritySettings";
import ProfileSettings from "./features/settings/ProfileSettings";
import GeneralSettings from "./features/settings/GeneralSettings";

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
