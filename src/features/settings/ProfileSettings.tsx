import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Button from "../../components/ui/Button";
import ImageUploader from "./ImageUploader";
import useAuth from "../auth/useAuth";
import { LabeledInput } from "../../components/ui/InputLabel";
import Input from "../../components/ui/Input";
import InputText from "../../components/ui/InputText";
import AddButton from "../../components/ui/AddButton";
import Field from "../../components/ui/Field";
import {
	usernameRules,
	displayNameRules,
	bioRules,
} from "../../utils/formRules";

type FormInput = {
	displayName: string;
	username: string;
	bio: string;
};

export default function ProfileSettings() {
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarRemoved, setAvatarRemoved] = useState(false);

	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [bannerRemoved, setBannerRemoved] = useState(false);

	const { user } = useAuth();

	const { handleSubmit, control, reset } = useForm<FormInput>({
		mode: "onTouched",
		values: {
			displayName: user?.displayName ?? "",
			username: user?.username ?? "",
			bio: user?.bio ?? "",
		},
	});

	const handleAvatarChange = (file: File | null) => {
		if (file === null) {
			setAvatarFile(null);
			setAvatarRemoved(true);
		} else {
			setAvatarFile(file);
			setAvatarRemoved(false);
		}
	};

	const handleBannerChange = (file: File | null) => {
		if (file === null) {
			setBannerFile(null);
			setBannerRemoved(true);
		} else {
			setBannerFile(file);
			setBannerRemoved(false);
		}
	};

	const handleAvatarReset = () => {
		setAvatarFile(null);
		setAvatarRemoved(false);
	};

	const handleBannerReset = () => {
		setBannerFile(null);
		setBannerRemoved(false);
	};

	const onSubmit: SubmitHandler<FormInput> = (data) => {
		console.log(data);
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6"
		>
			<h2 className="text-2xl font-display mb-4 mx-auto">
				Настройки профиля
			</h2>
			<div className="flex justify-around">
				<ImageUploader
					currentUrl={avatarRemoved ? null : user?.avatarUrl}
					file={avatarFile}
					onChange={handleAvatarChange}
					variant="avatar"
				/>
				<ImageUploader
					currentUrl={bannerRemoved ? null : user?.bannerUrl}
					file={bannerFile}
					onChange={handleBannerChange}
					variant="banner"
				/>
			</div>

			<Field
				name="displayName"
				control={control}
				rules={displayNameRules}
				label="Отображаемое имя"
			>
				{(field) => (
					<Input
						{...field}
						type="text"
						className="w-full"
						maxLength={100}
					/>
				)}
			</Field>

			<Field
				name="username"
				control={control}
				rules={usernameRules}
				label="Имя пользователя"
			>
				{(field) => <Input {...field} type="text" className="w-full" />}
			</Field>

			<Field
				name="bio"
				control={control}
				rules={bioRules}
				label="О себе"
			>
				{(field) => (
					<InputText {...field} className="w-full" maxLength={500} />
				)}
			</Field>

			<LabeledInput label="Прикрепить социальную сеть">
				{user?.links?.map((link) => (
					<Input
						type="text"
						className="input"
						defaultValue={link.url}
					/>
				))}
				<AddButton onClick={() => {}} className="self-center" />
			</LabeledInput>

			<nav className="self-end flex gap-3">
				<Button
					type="reset"
					variant="secondary"
					onClick={() => {
						reset();
						handleAvatarReset();
						handleBannerReset();
					}}
				>
					Сбросить
				</Button>
				<Button type="submit" variant="primary">
					Сохранить изменения
				</Button>
			</nav>
		</form>
	);
}
