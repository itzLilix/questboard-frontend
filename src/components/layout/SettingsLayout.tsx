import { Outlet } from "react-router-dom";
import { NavMenu, NavMenuItem } from "../ui/NavMenu";

export default function SettingsLayout() {
	return (
		<main className="w-960 p-4 flex flex-1 mx-auto overflow-hidden min-h-0">
			<aside className="w-1/5 flex flex-col items-start gap-4 p-4">
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
			<section className="flex-1 bg-(--bg-card) rounded-2xl p-6 border border-(--border) overflow-y-auto">
				<Outlet />
			</section>
		</main>
	);
}
