import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import RequireAuth from "./features/auth/RequireAuth";
import NotificationSettings from "./features/settings/NotificationSettings";
import SecuritySettings from "./features/settings/SecuritySettings";
import ProfileSettings from "./features/settings/ProfileSettings";
import GeneralSettings from "./features/settings/GeneralSettings";
import FollowingPage from "./features/following/FollowingPage";
import GMsPage from "./features/usersCatalog/GMsPage";
import HomePage from "./features/home/HomePage";
import NewSessionPage from "./features/session/create/NewSessionPage";
import SessionsPage from "./features/session/catalog/SessionsCatalog";
import SessionLayout from "./features/session/SessionLayout";
import {
	ApplicationsTab,
	NotesTab,
	PlayTab,
	VTTTab,
} from "./features/session/sessionTabs/sessionTabs";
import { InfoTab } from "./features/session/sessionTabs/InfoTab";
import { EditTab } from "./features/session/sessionTabs/EditTab";
import { useCuratedSystemsQuery } from "./features/session/queries";
import SettingsLayout from "./features/settings/SettingsLayout";
import ProfileLayout, {
	ProfileSessionsList,
} from "./features/profile/ProfileLayout";
import MySessionsLayout, {
	CancelledTab,
	DraftsTab,
	MasteringTab,
	PlayingTab,
} from "./features/session/ownLists/MySessions";
import { SessionScope } from "./features/session/api";
import { CampaignTab } from "./features/session/sessionTabs/CampaignTab";
import { ChatTab } from "./features/session/sessionTabs/chatsTab/ChatsTab";

function App() {
	useCuratedSystemsQuery();

	return (
		<Routes>
			<Route element={<RootLayout />}>
				<Route index element={<HomePage />} />
				<Route path="/users/:username" element={<ProfileLayout />}>
					<Route index element={<Navigate to="hosted" replace />} />
					<Route
						path="hosted"
						element={
							<ProfileSessionsList
								scope={SessionScope.Mastering}
							/>
						}
					></Route>
					<Route
						path="played"
						element={
							<ProfileSessionsList scope={SessionScope.Playing} />
						}
					></Route>
					<Route path="reviews"></Route>
				</Route>
				<Route path="/game-masters" element={<GMsPage />} />
				<Route path="/sessions" element={<SessionsPage />} />
				<Route path="/sessions/:id" element={<SessionLayout />}>
					<Route index element={<Navigate to="info" replace />} />
					<Route path="*" element={<Navigate to="info" replace />} />
					<Route path="info" element={<InfoTab />} />
					<Route path="campaign" element={<CampaignTab />} />
					<Route path="chat" element={<ChatTab />} />
					<Route path="data" element={<PlayTab />} />
					<Route path="vtt" element={<VTTTab />} />
					<Route path="notes" element={<NotesTab />} />
					<Route path="edit" element={<EditTab />} />
					<Route path="applications" element={<ApplicationsTab />} />
				</Route>
				<Route element={<RequireAuth />}>
					<Route path="/sessions/new" element={<NewSessionPage />} />
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
					<Route path="sessions/my" element={<MySessionsLayout />}>
						<Route
							index
							element={<Navigate to="mastering" replace />}
						/>
						<Route path="mastering" element={<MasteringTab />} />
						<Route path="playing" element={<PlayingTab />} />
						<Route path="drafts" element={<DraftsTab />} />
						<Route path="cancelled" element={<CancelledTab />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}

export default App;
