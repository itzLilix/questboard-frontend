import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useAuth from "../../hooks/useAuth";
import NotificationBell from "../ui/NotificationBell";
import useAuthModal from "../../hooks/useAuthModal";
import Loading from "../ui/Loading";
import AvatarImage from "../ui/AvatarImage";
import { useEffect, useRef, useState } from "react";
import Menu, { MenuDivider, MenuItem } from "../ui/Menu";
import Icon from "../ui/Icon";
import type { IUser } from "../../types/types";

export default function Header() {
	const { isLoading, user, logout } = useAuth();
	const { openAuthModal } = useAuthModal();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsProfileMenuOpen(false);
			}
		};

		if (isProfileMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isProfileMenuOpen]);

	function ProfileMenu({ user }: { user: IUser }) {
		return (
			<Menu isOpen={isProfileMenuOpen} side="right" className="min-w-48">
				<div className="flex flex-col items-center gap-2 p-3">
					<AvatarImage user={user} size="md" />
					<div className="flex flex-col items-start">
						<span>{user.displayName}</span>
						<span className="text-sm text-(--text-secondary)">
							@{user.username}
						</span>
					</div>
				</div>
				<MenuDivider />
				<MenuItem
					onClick={() => {}}
					before={
						<Icon
							name="account_circle"
							className="text-lg! text-(--text-secondary)!"
						/>
					}
				>
					Профиль
				</MenuItem>
				<MenuItem
					onClick={() => {}}
					before={
						<Icon
							name="settings"
							className="text-lg! text-(--text-secondary)!"
						/>
					}
				>
					Настройки
				</MenuItem>
				<MenuItem
					onClick={() => {
						logout();
					}}
					before={
						<Icon
							name="logout"
							className="text-lg! text-(--error)!"
						/>
					}
				>
					Выйти
				</MenuItem>
			</Menu>
		);
	}

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
						to="/"
						className="text-(--text-secondary) hover:text-(--accent)"
					>
						Сессии
					</Link>
					<Link
						to="/"
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
						<div ref={menuRef}>
							<button
								className="flex items-center justify-end gap-2 cursor-pointer"
								onClick={() =>
									setIsProfileMenuOpen(!isProfileMenuOpen)
								}
							>
								<span className="text-(--text-primary)">
									{user.username}
								</span>
								<AvatarImage user={user} size="sm" />
							</button>
							<div className="relative">
								<ProfileMenu user={user} />
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-4">
						<Button
							variant="secondary"
							csize="sm"
							onClick={() => openAuthModal("login")}
						>
							Вход
						</Button>
						<Button
							variant="primary"
							csize="sm"
							onClick={() => openAuthModal("register")}
						>
							Регистрация
						</Button>
					</div>
				)}
			</div>
		</header>
	);
}
