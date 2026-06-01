import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Controller,
	useForm,
	useWatch,
	type SubmitHandler,
} from "react-hook-form";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import {
	SessionAvailability,
	SessionFormat,
	type ILocation,
} from "../../types/session";
import type { ISystem } from "../../types/userCard";
import Input from "../../components/ui/inputs/Input";
import Field from "../../components/ui/inputs/Field";
import InputText from "../../components/ui/inputs/InputText";
import { LabeledInput } from "../../components/ui/inputs/InputLabel";
import ImageUploader from "../settings/ImageUploader";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import SystemSearch from "./SystemSearch";
import NewCampaignPopover, {
	type CreateCampaignInput,
} from "./NewCampaignPopover";
import {
	useCampaignsQuery,
	useCreateCampaignMutation,
	useCreateSessionMutation,
} from "./queries";
import type { CreateSessionPayload } from "./api";
import SessionFactsList from "./SessionFactsList";
import { formatDate, timeAddTz } from "../../utils/dateFormats";
import useAuth from "../../hooks/useAuth";
import { AVAILABILITY_OPTIONS, FORMAT_OPTIONS } from "../../utils/words";
import { CampaignStatus, type ICampaign } from "../../types/campaign";
import { SystemBadge } from "../../components/ui/SystemBadge";

export interface CreateSessionInput {
	campaignId: string | null;
	title: string;
	description: string;
	image: File | null;
	system: ISystem | null;
	format: SessionFormat;
	location: ILocation | null;
	scheduledAt: string;
	startTime: string;
	durationHours: number;
	maxSeats: number;
	price: string;
	isFree: boolean;
	availability: SessionAvailability;
}

const titleRules = {
	required: "Название обязательно",
	minLength: { value: 3, message: "Минимум 3 символа" },
	maxLength: { value: 255, message: "Максимум 255 символов" },
};

const descriptionRules = {
	maxLength: { value: 2000, message: "Максимум 2000 символов" },
};

const seatsRules = {
	required: "Укажите количество мест",
	min: { value: 1, message: "Минимум 1 место" },
	max: { value: 50, message: "Максимум 50 мест" },
};

function SessionPreview({
	values,
	campaign,
}: {
	values: Partial<CreateSessionInput>;
	campaign?: ICampaign;
}) {
	const date = formatDate(values.scheduledAt);
	const time = timeAddTz(values.startTime);

	const previewUrl = values.image ? URL.createObjectURL(values.image) : null;

	return (
		<>
			<p className="text-2xl font-display text-(--text-primary) leading-tight min-h-8 inline-flex gap-3 items-baseline">
				{values.title || "Название"}
				{campaign && (
					<span className="text-(--text-secondary) text-xl">
						#{campaign.sessionCount + 1} в {campaign.title}
					</span>
				)}
			</p>

			<div className="w-full aspect-video rounded-lg bg-(--bg-elevated) overflow-hidden flex items-center justify-center">
				{previewUrl ? (
					<img
						src={previewUrl}
						alt="cover"
						className="w-full h-full object-cover"
					/>
				) : (
					<span className="text-(--text-muted) text-sm">Обложка</span>
				)}
			</div>

			<SessionFactsList
				facts={[
					{
						label: "Формат:",
						value: values.format
							? FORMAT_OPTIONS.find(
									(o) => o.value === values.format,
								)?.label
							: null,
					},
					{
						label: "Дата:",
						value: values.scheduledAt ? date : null,
					},
					{
						label: "Время:",
						value: values.startTime ? time : null,
					},
					{ label: "Адрес:", value: values.location?.address },
					{
						label: "Система:",
						value: campaign?.system?.name ?? values.system?.name,
					},
					{
						label: "Доступность:",
						value: values.availability
							? AVAILABILITY_OPTIONS.find(
									(o) => o.value === values.availability,
								)?.label
							: null,
					},
				]}
			/>
		</>
	);
}

export default function NewSessionPage() {
	const { user } = useAuth();

	const navigate = useNavigate();
	const createSession = useCreateSessionMutation();
	const createCampaign = useCreateCampaignMutation();
	const campaignsQuery = useCampaignsQuery(
		{ masterId: user?.id, status: CampaignStatus.Active },
		{ enabled: !!user },
	);
	const campaigns = campaignsQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const [newCampaignMenu, toggleNewCampaign] = useState(false);
	const [campaignDraftDirty, setCampaignDraftDirty] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const { control, handleSubmit, register, setValue, watch } =
		useForm<CreateSessionInput>({
			mode: "onTouched",
			defaultValues: {
				campaignId: null,
				title: "",
				description: "",
				image: null,
				system: null,
				format: SessionFormat.Offline,
				location: null,
				scheduledAt: "",
				startTime: "",
				durationHours: 4,
				maxSeats: 4,
				price: "",
				isFree: false,
				availability: SessionAvailability.Open,
			},
		});

	const watchedValues = useWatch({ control });
	const isFree = watch("isFree");
	const availability = watch("availability");
	const format = watch("format");
	const campaignId = watch("campaignId");
	const campaign = campaigns.find((c) => c.id === campaignId);

	const campaignOptions = [
		{ value: "", label: "Одиночная сессия" },
		...campaigns.map((c: ICampaign) => ({ value: c.id, label: c.title })),
	];

	if (!user) {
		return;
	}

	const buildPayload = (
		data: CreateSessionInput,
	): CreateSessionPayload | null => {
		const system = campaign?.system ?? data.system;
		if (!system) {
			setSubmitError("Выберите систему");
			return null;
		}

		let scheduledAt: string | undefined;
		if (data.scheduledAt) {
			const time = data.startTime || "00:00";
			const local = new Date(`${data.scheduledAt}T${time}:00`);
			if (!isNaN(local.getTime())) scheduledAt = local.toISOString();
		}

		// `register("location")` writes a plain address string into the
		// `location` field, so the runtime value isn't an ILocation object.
		const addressRaw = data.location as unknown;
		const address = typeof addressRaw === "string" ? addressRaw.trim() : "";
		const location: ILocation | undefined =
			data.format === SessionFormat.Offline && address
				? { address, lat: 0, lng: 0 }
				: undefined;

		const price = data.isFree
			? 0
			: data.price === "" || data.price == null
				? undefined
				: Number(data.price);

		return {
			title: data.title.trim(),
			format: data.format,
			systemId: system.id,
			maxSeats: data.maxSeats,
			scheduledAt,
			description: data.description?.trim() || undefined,
			location,
			durationHours: data.durationHours || undefined,
			price,
			availability: data.availability,
		};
	};

	const submit =
		(publish: boolean): SubmitHandler<CreateSessionInput> =>
		(data) => {
			setSubmitError(null);
			if (newCampaignMenu && campaignDraftDirty) {
				setSubmitError(
					"Завершите создание нового кампейна или очистите его поля перед сохранением сессии.",
				);
				return;
			}
			const payload = buildPayload(data);
			if (!payload) return;
			createSession.mutate(
				{
					payload,
					publish,
					gmUsername: user.username,
					campaignId: data.campaignId ?? undefined,
				},
				{
					onSuccess: (data) => navigate(`/sessions/${data.id}`),
					onError: () =>
						setSubmitError(
							"Не удалось сохранить сессию. Попробуйте ещё раз.",
						),
				},
			);
		};

	const handleCampaignCreated = async (data: CreateCampaignInput) => {
		const campaign = await createCampaign.mutateAsync({
			title: data.title.trim(),
			description: data.description?.trim() || undefined,
			availability: data.availability,
			systemId: data.system?.id || undefined,
		});
		setValue("campaignId", campaign.id, { shouldDirty: true });
		if (campaign.system && !watch("system")) {
			setValue("system", campaign.system, { shouldDirty: true });
		}
	};

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Создать сессию
			</h1>
			<form className="flex w-full gap-6">
				<section className="flex flex-1 flex-col gap-4">
					<TextField title="Кампейн" isShrinkable={false}>
						<LabeledInput label="Привязать к кампейну">
							<div className="flex gap-4">
								<Controller
									name="campaignId"
									control={control}
									render={({ field }) => (
										<Dropdown
											label=""
											options={campaignOptions}
											value={field.value ?? ""}
											onChange={(v) =>
												field.onChange(
													v === "" ? null : v,
												)
											}
											disabled={newCampaignMenu}
											placeholder="Одиночная сессия"
											fullWidth
											className="flex-1"
											onEndReached={() => {
												if (
													campaignsQuery.hasNextPage &&
													!campaignsQuery.isFetchingNextPage
												) {
													campaignsQuery.fetchNextPage();
												}
											}}
										/>
									)}
								/>

								<Button
									type="button"
									variant="secondary"
									onClick={() => toggleNewCampaign((o) => !o)}
								>
									+ Новый кампейн
								</Button>
							</div>

							{newCampaignMenu && (
								<NewCampaignPopover
									onConfirm={handleCampaignCreated}
									onClose={() => toggleNewCampaign((o) => !o)}
									onDirtyChange={setCampaignDraftDirty}
								/>
							)}

							{campaign && !newCampaignMenu && (
								<div className="flex flex-col gap-4 mt-4">
									<div className="inline-flex gap-3 items-center">
										<span className="text-2xl font-display text-(--text-primary)">
											{campaign.title}
										</span>
										{campaign.system && (
											<SystemBadge
												system={campaign.system}
											/>
										)}
									</div>
									<p className="text-(--text-secondary) text-base">
										{campaign.description ?? "Нет описания"}
									</p>
								</div>
							)}
						</LabeledInput>
					</TextField>
					<TextField title="Основное" isShrinkable={false}>
						<LabeledInput label="Система">
							<Controller
								name="system"
								control={control}
								render={({ field }) => (
									<SystemSearch
										value={campaign?.system ?? field.value}
										onChange={field.onChange}
										disabled={
											campaign !== undefined &&
											campaign?.system !== null
										}
									/>
								)}
							/>
						</LabeledInput>

						<Field
							name="title"
							control={control}
							rules={titleRules}
							label="Название"
						>
							{(field) => (
								<Input
									{...field}
									type="text"
									className="w-full"
									maxLength={titleRules.maxLength.value}
								/>
							)}
						</Field>

						<Field
							name="description"
							control={control}
							rules={descriptionRules}
							label="Описание"
						>
							{(field) => (
								<InputText
									{...field}
									className="w-full"
									maxLength={descriptionRules.maxLength.value}
								/>
							)}
						</Field>

						<LabeledInput label="Изображение">
							<Controller
								name="image"
								control={control}
								render={({ field }) => (
									<ImageUploader
										currentUrl={undefined}
										file={field.value}
										onChange={(f) => {
											field.onChange(f);
										}}
										variant="free"
									/>
								)}
							/>
						</LabeledInput>
					</TextField>
					<TextField title="Время и место" isShrinkable={false}>
						<div className="grid grid-cols-2 gap-4">
							<LabeledInput label="Формат">
								<Controller
									name="format"
									control={control}
									render={({ field }) => (
										<Dropdown
											label=""
											options={FORMAT_OPTIONS}
											value={field.value}
											onChange={(v) =>
												field.onChange(
													v ?? SessionFormat.Offline,
												)
											}
											fullWidth
										/>
									)}
								/>
							</LabeledInput>
							<LabeledInput label="Адрес">
								<Input
									{...register("location")}
									type="text"
									placeholder="Город, улица, дом"
									className="w-full"
									disabled={format === SessionFormat.Online}
								/>
							</LabeledInput>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<LabeledInput label="Дата">
								<Input
									{...register("scheduledAt")}
									type="date"
									className="w-full"
								/>
							</LabeledInput>
							<LabeledInput label="Время начала">
								<Input
									{...register("startTime")}
									type="time"
									className="w-full"
									placeholder="19:00"
								/>
							</LabeledInput>
							<LabeledInput label="Длительность">
								<Input
									{...register("durationHours", {
										valueAsNumber: true,
									})}
									type="number"
									min={1}
									max={24}
									step={0.5}
									placeholder="4 часа"
									className="w-full"
								/>
							</LabeledInput>
						</div>
					</TextField>
					<TextField title="Бронь" isShrinkable={false}>
						<Field
							name="maxSeats"
							control={control}
							rules={seatsRules}
							label="Количество мест"
						>
							{(field) => (
								<Input
									{...field}
									type="number"
									min={seatsRules.min.value}
									max={seatsRules.max.value}
									className="w-full"
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
								/>
							)}
						</Field>
						<LabeledInput label="Цена">
							<div className="flex items-center gap-4">
								<Input
									{...register("price")}
									type="number"
									min={0}
									placeholder="1000"
									className="flex-1"
									disabled={isFree}
								/>
								<label className="flex items-center gap-2 text-base text-(--text-primary) cursor-pointer select-none">
									<input
										type="checkbox"
										{...register("isFree")}
										onChange={(e) => {
											setValue(
												"isFree",
												e.target.checked,
												{ shouldDirty: true },
											);
											if (e.target.checked)
												setValue("price", "");
										}}
										className="accent-(--accent) w-4 h-4"
									/>
									Бесплатно
								</label>
							</div>
						</LabeledInput>
						<LabeledInput label="Доступность">
							<div className="grid grid-cols-3 gap-2">
								{AVAILABILITY_OPTIONS.map((opt) => (
									<FilterToggle
										key={opt.value}
										label={opt.label}
										isActive={opt.value === availability}
										onChange={() =>
											setValue(
												"availability",
												opt.value,
												{ shouldDirty: true },
											)
										}
									/>
								))}
							</div>
							<p className="mt-2 text-sm text-(--text-muted) text-center">
								{
									AVAILABILITY_OPTIONS.find(
										(o) => o.value === availability,
									)?.hint
								}
							</p>
						</LabeledInput>
					</TextField>
				</section>
				<section className="flex w-2/5 flex-col gap-4 sticky top-(--header-h) pt-6 self-start">
					<TextField title="Предпросмотр" isShrinkable={false}>
						<SessionPreview
							values={
								watchedValues as Partial<CreateSessionInput>
							}
							campaign={campaign}
						/>
					</TextField>
					{submitError && (
						<p className="text-sm text-(--error) text-center">
							{submitError}
						</p>
					)}
					<Button
						variant={"secondary"}
						fullWidth
						csize={"md"}
						disabled={createSession.isPending}
						onClick={handleSubmit(submit(false))}
					>
						Сохранить черновик
					</Button>
					<Button
						variant={"primary"}
						fullWidth
						csize={"md"}
						disabled={createSession.isPending}
						onClick={handleSubmit(submit(true))}
					>
						Опубликовать
					</Button>
				</section>
			</form>
		</div>
	);
}
