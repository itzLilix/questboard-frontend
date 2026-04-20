import { Outlet } from "react-router-dom";
import { NavMenu, NavMenuItem } from "../ui/NavMenu";

export default function SettingsLayout() {
	return (
		<main className="max-w-960 mx-auto p-4 flex">
			<aside className="w-1/5 flex flex-col items-start gap-4 p-4 sticky top-18 self-start">
				<h1 className="text-2xl font-display mb-4 mx-auto">
					Настройки
				</h1>
				<NavMenu>
					<NavMenuItem to="/settings/general">Основное</NavMenuItem>
					<NavMenuItem to="/settings/profile">Профиль</NavMenuItem>
					<NavMenuItem to="/settings/security">
						Безопасность
					</NavMenuItem>
					<NavMenuItem to="/settings/notifications">
						Уведомления
					</NavMenuItem>
				</NavMenu>
			</aside>
			<section className="flex-1 bg-(--bg-card) rounded-2xl p-6 border border-(--border)">
				<Outlet />
			</section>
		</main>
	);
}
