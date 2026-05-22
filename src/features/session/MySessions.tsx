import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Tab from "../../components/ui/Tab";
import { options, type Option } from "../../utils/options";

const TAB_OPTIONS = options([
	{ value: "mastering", label: "Мастер" },
	{ value: "playing", label: "Игрок" },
	{ value: "drafts", label: "Черновики" },
	{ value: "cancelled", label: "Отмененные" },
]) satisfies readonly Option<string>[];

export default function MySessionsLayout() {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const active = pathname.split("/").at(-1);

	return (
		<div className="w-960 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Мои сессии
			</h1>
			<main>
				<nav className="mx-auto font-display text-2xl flex gap-4">
					{TAB_OPTIONS.map((o) => (
						<Tab
							key={o.value}
							onClick={() => navigate(o.value)}
							isActive={active === o.value}
						>
							{o.label}
						</Tab>
					))}
				</nav>
				<div className="flex flex-col gap-4 mb-6">
					{/* filters */}
					{/* группировка по кампейнам - ??? */}
					{/* мапить системы, либо systemsearch */}
				</div>
				<Outlet />
			</main>
		</div>
	);
}
