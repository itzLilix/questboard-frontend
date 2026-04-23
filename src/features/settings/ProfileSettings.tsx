import { useEffect } from "react";
import {
	Controller,
	useFieldArray,
	useForm,
	useWatch,
	type Control,
	type SubmitHandler,
	type UseFormSetValue,
} from "react-hook-form";
import Button from "../../components/ui/Button";
import ImageUploader from "./ImageUploader";
import useAuth from "../auth/useAuth";
import { LabeledInput } from "../../components/ui/InputLabel";
import Input from "../../components/ui/Input";
import InputText from "../../components/ui/InputText";
import AddButton from "../../components/ui/AddButton";
import Field from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import ErrorMessage from "../../components/ui/ErrorMessage";
import {
	usernameRules,
	displayNameRules,
	bioRules,
	socialUrlRules,
} from "../../utils/formRules";
import { useUpdateProfileMutation, type UpdateProfileInput } from "./queries";
import { detectPlatform } from "../socials/platforms";
import genericIcon from "../../assets/socials/generic.png";

type FormInput = UpdateProfileInput & {
	avatar: File | null;
	avatarRemoved: boolean;
	banner: File | null;
	bannerRemoved: boolean;
};

const TEXT_KEYS: (keyof UpdateProfileInput)[] = [
	"displayName",
	"username",
	"bio",
	"links",
];

export default function ProfileSettings() {
	const { user } = useAuth();
	const updateProfile = useUpdateProfileMutation();

	const {
		handleSubmit,
		control,
		reset,
		formState: { dirtyFields, isDirty, errors },
		setValue,
		setError,
		clearErrors,
	} = useForm<FormInput>({
		mode: "onTouched",
		values: {
			displayName: user?.displayName ?? "",
			username: user?.username ?? "",
			bio: user?.bio ?? "",
			links: user?.links ?? [],
			avatar: null,
			avatarRemoved: false,
			banner: null,
			bannerRemoved: false,
		},
	});

	const avatarRemoved = useWatch({ control, name: "avatarRemoved" });
	const bannerRemoved = useWatch({ control, name: "bannerRemoved" });

	const { fields, append, remove } = useFieldArray({
		control,
		name: "links",
	});

	const validateLinks = () => {
		if (fields.length > 10) {
			setError("links", {
				type: "manual",
				message: "Не более 10 ссылок",
			});
			return false;
		}
		clearErrors("links");
		return true;
	};

	const onSubmit: SubmitHandler<FormInput> = (data) => {
		if (!validateLinks()) return;

		const patch: Partial<UpdateProfileInput> = Object.fromEntries(
			TEXT_KEYS.filter((k) => dirtyFields[k]).map((k) => [k, data[k]]),
		);

		const avatarIntent: File | null | "unchanged" =
			data.avatar instanceof File
				? data.avatar
				: data.avatarRemoved
					? null
					: "unchanged";
		const bannerIntent: File | null | "unchanged" =
			data.banner instanceof File
				? data.banner
				: data.bannerRemoved
					? null
					: "unchanged";

		updateProfile.mutate({
			patch,
			avatar: avatarIntent,
			banner: bannerIntent,
		});
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6 relative"
		>
			<h2 className="text-2xl font-display mb-4 mx-auto">
				Настройки профиля
			</h2>
			<div className="flex justify-around">
				<Controller
					name="avatar"
					control={control}
					render={({ field }) => (
						<ImageUploader
							currentUrl={avatarRemoved ? null : user?.avatarUrl}
							file={field.value}
							onChange={(f) => {
								field.onChange(f);
								setValue("avatarRemoved", f === null, {
									shouldDirty: true,
								});
							}}
							variant="avatar"
						/>
					)}
				/>
				<Controller
					name="banner"
					control={control}
					render={({ field }) => (
						<ImageUploader
							currentUrl={bannerRemoved ? null : user?.bannerUrl}
							file={field.value}
							onChange={(f) => {
								field.onChange(f);
								setValue("bannerRemoved", f === null, {
									shouldDirty: true,
								});
							}}
							variant="banner"
						/>
					)}
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
			<Field name="bio" control={control} rules={bioRules} label="О себе">
				{(field) => (
					<InputText {...field} className="w-full" maxLength={500} />
				)}
			</Field>
			<LabeledInput label="Прикрепить социальную сеть">
				<div className="flex flex-col gap-6 p-6 relative">
					{fields.map((f, i) => (
						<SocialLinkRow
							key={f.id}
							control={control}
							index={i}
							setValue={setValue}
							onRemove={() => {
								remove(i);
								validateLinks();
							}}
						/>
					))}
					<ErrorMessage errMsg={errors.links?.message} />
					<AddButton
						onClick={() => {
							validateLinks();
							append({ type: "", url: "" });
						}}
						disabled={errors.links !== undefined}
						className="self-center"
					/>
				</div>
			</LabeledInput>
			<nav className="flex gap-3 sticky bottom-0 justify-end bg-(--bg-card) pt-4 pb-6 transform translate-y-6 border-t border-(--border)">
				<Button
					type="reset"
					variant="secondary"
					onClick={() => reset()}
					disabled={updateProfile.isPending}
				>
					Сбросить
				</Button>
				<Button
					type="submit"
					variant="primary"
					disabled={updateProfile.isPending || !isDirty}
				>
					Сохранить изменения
				</Button>
			</nav>
		</form>
	);
}

type SocialLinkRowProps = {
	control: Control<FormInput>;
	index: number;
	setValue: UseFormSetValue<FormInput>;
	onRemove: () => void;
};

function SocialLinkRow({
	control,
	index,
	setValue,
	onRemove,
}: SocialLinkRowProps) {
	const url = useWatch({ control, name: `links.${index}.url` });
	const currentType = useWatch({ control, name: `links.${index}.type` });
	const platform = detectPlatform(url ?? "");
	const detectedName = platform?.name ?? "";

	useEffect(() => {
		if (currentType !== detectedName) {
			setValue(`links.${index}.type`, detectedName, {
				shouldDirty: true,
			});
		}
	}, [currentType, detectedName, index, setValue]);

	return (
		<div className="flex items-center gap-2">
			<img
				src={platform?.iconUrl ?? genericIcon}
				alt={platform?.label}
				className="w-8 h-8 shrink-0"
			/>
			<Controller
				name={`links.${index}.url`}
				control={control}
				rules={socialUrlRules}
				render={({ field, fieldState }) => (
					<div className="relative grow">
						<Input
							{...field}
							type="url"
							placeholder="https://..."
							className="w-full"
							onBlur={() => {
								if (url.trim() === "") onRemove();
							}}
						/>
						<ErrorMessage errMsg={fieldState.error?.message} />
					</div>
				)}
			/>
			<button
				type="button"
				onClick={onRemove}
				className="p-1 flex items-center justify-center rounded-full hover:bg-(--bg-elevated) text-(--text-muted) hover:text-(--text-primary) cursor-pointer "
				aria-label="Удалить ссылку"
				name="Удалить ссылку"
			>
				<Icon name="close" />
			</button>
		</div>
	);
}
