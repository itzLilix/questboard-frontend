import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import ProfileLayout from "./components/layout/ProfileLayout";
import SettingsLayout from "./components/layout/SettingsLayout";
import RequireAuth from "./features/auth/RequireAuth";
import NotificationSettings from "./features/settings/NotificationSettings";
import SecuritySettings from "./features/settings/SecuritySettings";
import ProfileSettings from "./features/settings/ProfileSettings";
import GeneralSettings from "./features/settings/GeneralSettings";
import FollowingPage from "./features/following/FollowingPage";

function App() {
	return (
		<Routes>
			<Route element={<RootLayout />}>
				<Route path="/users/:username" element={<ProfileLayout />} />
				<Route element={<RequireAuth />}>
					<Route path="/following" element={<FollowingPage />} />
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
			</Route>
		</Routes>
	);
}

export default App;
