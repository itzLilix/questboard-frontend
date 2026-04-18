import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthModal from "../../hooks/useAuthModal";
import Input from "../ui/Input";
import Tab from "../ui/Tab";
import Button from "../ui/Button";
import { api } from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { LabeledInput } from "../ui/InputLabel";
import { mapError } from "../../api/mapError";

const LOGIN_URL = "/auth/login";
const REGISTER_URL = "/auth/signup";

const USER_REGEX = /^[A-Za-z][A-Za-z0-9-_]{2,32}$/;
const PWD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%])[A-Za-z0-9!@#$%]{8,24}$/;

export default function AuthModal() {
	const { isOpen, modalType, openAuthModal, closeAuthModal } = useAuthModal();
	const { login } = useAuth();

	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [pwd, setPwd] = useState("");
	const [errMsg, setErrMsg] = useState("");

	const isLogin = modalType === "login";

	useEffect(() => {
		setErrMsg("");
	}, [username, pwd]);

	useEffect(() => {
		setUsername("");
		setPwd("");
		setEmail("");
		setErrMsg("");
	}, [modalType]);

	if (!isOpen) return null;

	const validateRegister = () => {
		if (!USER_REGEX.test(username)) {
			return "Имя пользователя: 3-32 символа, буквы и цифры";
		}
		if (!PWD_REGEX.test(pwd)) {
			return "Пароль: 8-24 символа, буквы, цифры и !@#$%";
		}
		return null;
	};

	const handleLogin = async () => {
		const response = await api.post(LOGIN_URL, {
			email: email,
			password: pwd,
		});
		console.log(response);
		login(response.data);
	};

	const handleRegister = async () => {
		const validationError = validateRegister();
		if (validationError) {
			throw new Error(validationError);
		}

		const response = await api.post(REGISTER_URL, {
			email: email,
			username: username,
			password: pwd,
			displayName: displayName === "" ? username : displayName,
		});
		login(response.data);
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			if (modalType === "login") {
				await handleLogin();
			} else {
				await handleRegister();
			}
			closeAuthModal();
		} catch (err) {
			const error = mapError(err);
			setErrMsg(error.message);
		}
	};

	return (
		<>
			<div
				className="fixed inset-0 bg-black/20 z-40"
				onClick={closeAuthModal}
			></div>
			<div className="fixed h-180 w-150 m-auto inset-0 bg-(--bg-base-tp) backdrop-blur-lg flex items-stretch justify-start flex-col rounded-2xl border border-(--border) p-12 gap-6 z-50 animate-fade-in">
				<div className="text-3xl font-display text-(--text-primary) select-none mx-auto mt-6">
					<span className="text-(--accent)">Quest</span>
					<span>Board</span>
				</div>
				<nav className="w-full flex justify-center gap-6 text-3xl">
					<Tab
						isActive={modalType === "login"}
						onClick={() => {
							openAuthModal("login");
						}}
					>
						Вход
					</Tab>
					<Tab
						isActive={modalType === "register"}
						onClick={() => {
							openAuthModal("register");
						}}
					>
						Регистрация
					</Tab>
				</nav>

				<form
					key={modalType}
					onSubmit={handleSubmit}
					className="flex flex-col gap-4"
				>
					<span className="h-6 text-sm text-(--error) text-center">
						{errMsg}
					</span>

					<LabeledInput label="Электронная почта">
						<Input
							csize="md"
							className="w-full"
							type="email"
							name="email"
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</LabeledInput>

					{!isLogin && (
						<LabeledInput label="Имя пользователя">
							<Input
								csize="md"
								className="w-full"
								name="username"
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</LabeledInput>
					)}

					{!isLogin && (
						<LabeledInput label="Отображаемое имя (необязательно)">
							<Input
								csize="md"
								className="w-full"
								name="displayName"
								onChange={(e) => setDisplayName(e.target.value)}
							/>
						</LabeledInput>
					)}

					<LabeledInput label="Пароль">
						<Input
							type="password"
							csize="md"
							className="w-full"
							name="password"
							onChange={(e) => setPwd(e.target.value)}
							required
						/>
						{isLogin && (
							<Link
								to="/auth/reset-password"
								onClick={closeAuthModal}
								className="text-sm text-(--text-secondary) hover:text-(--accent) self-center mt-2"
							>
								Сброс пароля
							</Link>
						)}
					</LabeledInput>

					<Button
						variant="primary"
						csize="md"
						type="submit"
						className="mx-6 mt-6"
					>
						{isLogin ? "Войти" : "Зарегистрироваться"}
					</Button>
				</form>

				{isLogin && (
					<div className="flex items-center gap-4 my-12 mx-24">
						<div className="flex-1 border-t border-(--accent)" />
						<span className="text-base font-body text-(--accent)">
							или
						</span>
						<div className="flex-1 border-t border-(--accent)" />
					</div>
				)}
			</div>
		</>
	);
}
