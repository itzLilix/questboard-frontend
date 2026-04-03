import AppHeader from "./components/layout/AppHeader";
import AuthModal from "./components/layout/AuthModal";

function App() {
	return (
		<div className="h-screen w-screen bg-(--bg-base)">
			<AppHeader />
			<AuthModal />
		</div>
	);
}

export default App;
