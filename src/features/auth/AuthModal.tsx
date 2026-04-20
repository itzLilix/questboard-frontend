import { Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import Input from "../../components/ui/Input";
import Tab from "../../components/ui/Tab";
import Button from "../../components/ui/Button";
import { LabeledInput } from "../../components/ui/InputLabel";
import Field from "../../components/ui/Field";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { mapError } from "../../api/mapError";
import { useLoginMutation, useSignupMutation } from "./queries";
import { useAuthModal } from "./authModalStore";
import {
	emailRules,
	usernameRules,
	displayNameRules,
	passwordRules,
} from "../../utils/formRules";

type FormInput = {
	email: string;
	username: string;
	displayName: string;
	password: string;
};

export default function AuthModal() {
	const isOpen = useAuthModal((s) => s.isOpen);
	const modalType = useAuthModal((s) => s.modalType);
	const open = useAuthModal((s) => s.open);
	const close = useAuthModal((s) => s.close);

	const isLogin = modalType === "login";

	const login = useLoginMutation();
	const signup = useSignupMutation();

	const {
		handleSubmit,
		control,
		reset,
		setError,
		watch,
		formState: { errors },
	} = useForm<FormInput>({
		mode: "onTouched",
		defaultValues: {
			email: "",
			username: "",
			displayName: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<FormInput> = async (data) => {
		try {
			if (isLogin) {
				await login.mutateAsync(data);
			} else {
				if (data.displayName === "") data.displayName = data.username;
				await signup.mutateAsync(data);
			}
			close();
		} catch (err) {
			const error = mapError(err);
			setError("root", { message: error.message });
		}
	};

	const handleClose = () => {
		reset();
		close();
	};

	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black/20 z-40"
				onClick={handleClose}
			></div>
			<div className="fixed h-180 w-150 m-auto inset-0 bg-(--bg-base-tp) backdrop-blur-lg flex items-stretch justify-start flex-col rounded-2xl border border-(--border) p-12 gap-6 z-50 animate-fade-in">
				<div className="text-3xl font-display text-(--text-primary) select-none mx-auto mt-6">
					<span className="text-(--accent)">Quest</span>
					<span>Board</span>
				</div>
				<nav className="w-full flex justify-center gap-6 text-3xl">
					<Tab
						isActive={isLogin}
						onClick={() => {
							reset();
							open("login");
						}}
					>
						Вход
					</Tab>
					<Tab
						isActive={!isLogin}
						onClick={() => {
							reset();
							open("register");
						}}
					>
						Регистрация
					</Tab>
				</nav>

				<form
					key={modalType}
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-6 relative"
				>
					<ErrorMessage errMsg={errors.root?.message} />

					<Field
						name="email"
						control={control}
						rules={emailRules}
						label="Электронная почта"
					>
						{(field) => (
							<Input
								{...field}
								csize="md"
								className="w-full"
								type="email"
							/>
						)}
					</Field>

					{!isLogin && (
						<Field
							name="username"
							control={control}
							rules={usernameRules}
							label="Имя пользователя"
						>
							{(field) => (
								<Input
									{...field}
									csize="md"
									className="w-full"
								/>
							)}
						</Field>
					)}

					{!isLogin && (
						<Field
							name="displayName"
							control={control}
							rules={displayNameRules}
							label="Отображаемое имя (необязательно)"
						>
							{(field) => (
								<Input
									{...field}
									csize="md"
									className="w-full"
									maxLength={100}
									placeholder={watch("username")}
								/>
							)}
						</Field>
					)}

					<LabeledInput label="Пароль">
						<Field
							name="password"
							control={control}
							rules={passwordRules({ strong: !isLogin })}
						>
							{(field) => (
								<Input
									{...field}
									type="password"
									csize="md"
									className="w-full"
								/>
							)}
						</Field>
						{isLogin && (
							<Link
								to="/auth/reset-password"
								onClick={handleClose}
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
						disabled={login.isPending || signup.isPending}
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
