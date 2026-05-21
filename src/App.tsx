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
import GMsPage from "./features/usersCatalog/GMsPage";
import HomePage from "./features/home/HomePage";
import NewSessionPage from "./features/session/NewSessionPage";
import SessionsPage from "./features/session/SessionsPage";
import SessionLayout from "./features/session/SessionLayout";
import {
	CampaignTab,
	ChatTab,
	EditTab,
	InfoTab,
	NotesTab,
	PlayTab,
	VTTTab,
} from "./features/session/sessionTabs/sessionTabs";
import { useCuratedSystemsQuery } from "./features/session/queries";

function App() {
	useCuratedSystemsQuery();

	return (
		<Routes>
			<Route element={<RootLayout />}>
				<Route index element={<HomePage />} />
				<Route path="/users/:username" element={<ProfileLayout />} />
				<Route path="/game-masters" element={<GMsPage />} />
				<Route path="/sessions" element={<SessionsPage />} />
				<Route path="/sessions/:id" element={<SessionLayout />}>
					<Route index element={<Navigate to="info" replace />} />
					<Route path="info" element={<InfoTab />} />
					<Route path="campaign" element={<CampaignTab />} />
					<Route path="chat" element={<ChatTab />} />
					<Route path="data" element={<PlayTab />} />
					<Route path="vtt" element={<VTTTab />} />
					<Route path="notes" element={<NotesTab />} />
					<Route path="edit" element={<EditTab />} />
				</Route>
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
					<Route path="sessions/new" element={<NewSessionPage />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default App;
