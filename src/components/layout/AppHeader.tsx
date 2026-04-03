import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useAuth from "../../hooks/useAuth";
import NotificationBell from "../ui/NotificationBell";
import useAuthModal from "../../hooks/useAuthModal";
import Loading from "../ui/Loading";
import { useEffect } from "react";

export default function Header() {
	const { isLoading, user } = useAuth();
	const { openModal } = useAuthModal();

	return (
		<header className="bg-(--bg-base-tp) h-18 z-10 sticky top-0 w-full border-b border-(--border) backdrop-blur-sm">
			<div className="p-4 flex items-center justify-between h-full max-w-1600 mx-auto">
				<Link
					to="/"
					className="text-(--text-primary) text-2xl font-display select-none"
				>
					<span className="text-(--accent)">Quest</span>
					<span>Board</span>
				</Link>
				<div className="flex items-center space-x-4">
					<Link
						to="#"
						className="text-(--text-secondary) hover:text-(--accent)"
					>
						Сессии
					</Link>
					<Link
						to="#"
						className="text-(--text-secondary) hover:text-(--accent)"
					>
						Мастера
					</Link>
				</div>
				<Input placeholder={"Поиск..."} csize={"sm"} type="search" />
				<Button onClick={() => {}} variant="secondary" csize="sm">
					+ Создать сессию
				</Button>
				{isLoading ? (
					<Loading className="text-2xl" />
				) : user ? (
					<div className="flex items-center gap-6">
						<NotificationBell />
						<div className="flex items-center gap-2">
							<span className="text-(--text-primary)">
								{user.username}
							</span>
							{user.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt={user.username}
									className="w-8 h-8 rounded-full"
								/>
							) : (
								<div className="w-8 h-8 rounded-full bg-(--accent) flex items-center justify-center text-sm">
									{user.username[0].toUpperCase()}
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="flex items-center gap-4">
						<Button
							variant="secondary"
							csize="sm"
							onClick={() => openModal("login")}
						>
							Вход
						</Button>
						<Button
							variant="secondary"
							csize="sm"
							onClick={() => openModal("register")}
						>
							Регистрация
						</Button>
					</div>
				)}
			</div>
		</header>
	);
}
