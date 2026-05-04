import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useAuth from "../../hooks/useAuth";
import NotificationBell from "../../features/notifications/NotificationBell";
import Loading from "../ui/Loading";
import AvatarImage from "../ui/AvatarImage";
import { useEffect, useRef, useState } from "react";
import { MenuDivider, MenuItem } from "../ui/Menu";
import Icon from "../ui/Icon";
import type { IUser } from "../../types/user";
import { useLogoutMutation } from "../../features/auth/queries";
import { useAuthModal } from "../../features/auth/authModalStore";
import Logo from "../ui/Logo";

type ProfileMenuProps = {
	user: IUser;
	onClose: () => void;
};

function ProfileMenu({ user, onClose }: ProfileMenuProps) {
	const navigate = useNavigate();
	const logout = useLogoutMutation();

	const go = (path: string) => {
		onClose();
		navigate(path);
	};

	const handleLogoutClick = async () => {
		await logout.mutateAsync();
		onClose();
	};

	return (
		<>
			<div className="flex flex-col items-center gap-2 p-3">
				<AvatarImage
					src={user.avatarUrl}
					alt={user.username}
					size="md"
				/>
				<div className="flex flex-col items-start">
					<span>{user.displayName}</span>
					<span className="text-sm text-(--text-secondary)">
						@{user.username}
					</span>
				</div>
			</div>
			<MenuDivider />
			<MenuItem
				onClick={() => go(`/users/${user.username}`)}
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
				onClick={() => go("/following")}
				before={
					<Icon
						name="group"
						className="text-lg! text-(--text-secondary)!"
					/>
				}
			>
				Подписки
			</MenuItem>
			<MenuItem
				onClick={() => go("/settings")}
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
				onClick={handleLogoutClick}
				before={
					<Icon name="logout" className="text-lg! text-(--error)!" />
				}
				disabled={logout.isPending}
			>
				Выйти
			</MenuItem>
		</>
	);
}

export default function AppHeader() {
	const { isLoading, user } = useAuth();
	const openAuthModal = useAuthModal((s) => s.open);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [menuPos, setMenuPos] = useState<{
		top: number;
		right: number;
	} | null>(null);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isProfileMenuOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			const t = event.target as Node;
			if (
				!triggerRef.current?.contains(t) &&
				!menuRef.current?.contains(t)
			) {
				setIsProfileMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [isProfileMenuOpen]);

	const handleToggleMenu = () => {
		if (!isProfileMenuOpen && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setMenuPos({
				top: rect.bottom + 8,
				right: window.innerWidth - rect.right,
			});
		}
		setIsProfileMenuOpen((o) => !o);
	};

	return (
		<header className="bg-(--bg-base-tp) h-(--header-h) z-10 fixed top-0 w-full border-b border-(--border) backdrop-blur-lg">
			<div className="p-4 flex items-center justify-between h-full max-w-1600 mx-auto">
				<Link
					to="/"
					className="text-(--text-primary) text-2xl font-display select-none"
				>
					<Logo />
				</Link>
				<div className="flex items-center space-x-4">
					<Link
						to="/"
						className="text-(--text-secondary) hover:text-(--accent)"
					>
						Сессии
					</Link>
					<Link
						to="/game-masters"
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
						<button
							ref={triggerRef}
							className="flex items-center justify-end gap-2 cursor-pointer"
							onClick={handleToggleMenu}
						>
							<span className="text-(--text-primary)">
								{user.username}
							</span>
							<AvatarImage
								src={user.avatarUrl}
								alt={user.username}
								size="sm"
							/>
						</button>
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

			{isProfileMenuOpen &&
				menuPos &&
				user &&
				createPortal(
					<div
						ref={menuRef}
						className="fixed z-50 bg-(--bg-base-tp) backdrop-blur-lg border border-(--border) rounded-lg p-2 min-w-48"
						style={{ top: menuPos.top, right: menuPos.right }}
					>
						<ProfileMenu
							user={user}
							onClose={() => setIsProfileMenuOpen(false)}
						/>
					</div>,
					document.body,
				)}
		</header>
	);
}
