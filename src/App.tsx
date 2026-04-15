import AppHeader from "./components/layout/AppHeader";
import AuthModal from "./components/layout/AuthModal";
import useAuth from "./hooks/useAuth";
import ProfilePage from "./pages/ProfilePage";

function App() {
	const { user } = useAuth();
	return (
		<div className="h-screen w-screen bg-(--bg-base)">
			<AppHeader />
			<AuthModal />
			<ProfilePage profile={user} />
		</div>
	);
}

export default App;
