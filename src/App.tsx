import { Routes, Route } from "react-router-dom";
import AppHeader from "./components/layout/AppHeader";
import AuthModal from "./components/layout/AuthModal";
import ProfilePage from "./pages/ProfilePage";

function App() {
	return (
		<div className="h-screen w-screen bg-(--bg-base)">
			<AppHeader />
			<AuthModal />
			<Routes>
				<Route path="/users/:username" element={<ProfilePage />} />
			</Routes>
		</div>
	);
}

export default App;
