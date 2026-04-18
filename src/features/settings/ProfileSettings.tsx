import { useState } from "react";
import Button from "../../components/ui/Button";
import ImageUploader from "./ImageUploader";
import useAuth from "../auth/useAuth";
import { InputLabel, LabeledInput } from "../../components/ui/InputLabel";
import Input from "../../components/ui/Input";
import InputText from "../../components/ui/InputText";
import AddButton from "../../components/ui/AddButton";

export default function ProfileSettings() {
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarRemoved, setAvatarRemoved] = useState(false);

	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [bannerRemoved, setBannerRemoved] = useState(false);

	const { user } = useAuth();

	const handleAvatarChange = (file: File | null) => {
		if (file === null) {
			setAvatarFile(null);
			setAvatarRemoved(true); // signal: delete on save
		} else {
			setAvatarFile(file);
			setAvatarRemoved(false); // user picked a new one; cancel removal
		}
	};

	const handleBannerChange = (file: File | null) => {
		if (file === null) {
			setBannerFile(null);
			setBannerRemoved(true); // signal: delete on save
		} else {
			setBannerFile(file);
			setBannerRemoved(false); // user picked a new one; cancel removal
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

	return (
		<form className="flex flex-col gap-4">
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
			<LabeledInput label="Отображаемое имя">
				<Input
					type="text"
					className="input"
					defaultValue={user?.displayName || ""}
				/>
			</LabeledInput>
			<LabeledInput label="Имя пользователя">
				<Input
					type="text"
					className="input"
					defaultValue={user?.username || ""}
				/>
			</LabeledInput>
			<LabeledInput label="О себе">
				<InputText
					type="text"
					className="input"
					defaultValue={user?.bio || ""}
					maxLength={500}
				/>
			</LabeledInput>
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
