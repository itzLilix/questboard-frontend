import { useState } from "react";
import {
	Controller,
	useForm,
	useWatch,
	type SubmitHandler,
} from "react-hook-form";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import type {
	SessionFormat,
	SessionAvailability,
	Campaign,
	SessionStatus,
} from "../../types/session";
import type { ISystem } from "../../types/userCard";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import InputText from "../../components/ui/InputText";
import { LabeledInput } from "../../components/ui/InputLabel";
import ImageUploader from "../settings/ImageUploader";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/FilterToggle";
import SystemSearch from "./SystemSearch";
import NewCampaignPopover, {
	type CreateCampaignInput,
} from "./NewCampaignPopover";

export interface CreateSessionInput {
	campaignId: string | null;
	title: string;
	description: string;
	image: File | null;
	system: ISystem | null;
	format: SessionFormat;
	location: string;
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

const AVAILABILITY_OPTIONS: {
	value: SessionAvailability;
	label: string;
	hint: string;
}[] = [
	{
		value: "open",
		label: "Открытая",
		hint: "Любой желающий может записаться",
	},
	{
		value: "application",
		label: "По заявкам",
		hint: "Мастер одобряет каждую заявку",
	},
	{ value: "private", label: "Закрытая", hint: "Только по ссылке" },
];

const FORMAT_OPTIONS = [
	{ value: "offline", label: "Оффлайн" },
	{ value: "online", label: "Онлайн" },
];

function SessionPreview({ values }: { values: Partial<CreateSessionInput> }) {
	const formatDate = (d?: string) => {
		if (!d) return "—";
		const [, m, day] = d.split("-");
		const months = [
			"янв",
			"фев",
			"мар",
			"апр",
			"мая",
			"июн",
			"июл",
			"авг",
			"сен",
			"окт",
			"ноя",
			"дек",
		];
		return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
	};
	const timezone = new Date().getTimezoneOffset() / -60;

	// const formatLabel: Record<SessionFormat, string> = { online: "Онлайн", offline: "Оффлайн" };
	// const availabilityLabel: Record<SessionAvailability, string> = {
	// 	open: "Открытая", application: "По заявкам", private: "Закрытая",
	// };

	const previewUrl = values.image ? URL.createObjectURL(values.image) : null;

	return (
		<>
			<p className="text-2xl font-display text-(--text-primary) leading-tight min-h-8">
				{values.title || "Название"}
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

			<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base">
				{[
					[
						"Формат:",
						values.format
							? FORMAT_OPTIONS.find(
									(o) => o.value === values.format,
								)?.label
							: "—",
					],
					["Дата:", formatDate(values.scheduledAt)],
					[
						"Время:",
						values.startTime
							? `${values.startTime} / GMT${timezone >= 0 ? "+" + timezone : timezone}`
							: "—",
					],
					["Адрес:", values.location || "—"],
					["Система:", values.system?.name || "—"],
					[
						"Доступность:",
						values.availability
							? AVAILABILITY_OPTIONS.find(
									(o) => o.value === values.availability,
								)?.label
							: "—",
					],
				].map(([label, val]) => (
					<>
						<dt
							key={`l-${label}`}
							className="text-(--text-secondary)"
						>
							{label}
						</dt>
						<dd
							key={`v-${label}`}
							className="text-(--text-primary)"
						>
							{val}
						</dd>
					</>
				))}
			</dl>
		</>
	);
}

export default function NewSessionPage() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [newCampaignMenu, toggleNewCampaign] = useState(false);
	// const { data: systems = [] } = useSystemsQuery();
	// const { data: campaigns = [] } = useCampaignsQuery();
	// const createSession = useCreateSessionMutation();

	const { control, handleSubmit, register, setValue, watch } =
		useForm<CreateSessionInput>({
			mode: "onTouched",
			defaultValues: {
				campaignId: null,
				title: "",
				description: "",
				image: null,
				system: null,
				format: "offline",
				location: "",
				scheduledAt: "",
				startTime: "",
				durationHours: 4,
				maxSeats: 4,
				price: "",
				isFree: false,
				availability: "open",
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
		...campaigns.map((c: Campaign) => ({ value: c.id, label: c.title })),
	];

	const onSubmit: SubmitHandler<CreateSessionInput> = (data) => {
		// TODO: createSession.mutate({ ...data, status: intendedStatusRef.current });
		console.log("submit", data);
	};

	// When a campaign with a preset system is created, propagate the system
	// to the session form — but only if the user hasn't already chosen one.
	const handleCampaignCreated = (data: CreateCampaignInput) => {
		// TODO: call createCampaign mutation, get back the new campaign id,
		// append to campaigns list, and set campaignId in the form.
		if (data.system && !watch("system")) {
			setValue("system", data.system, { shouldDirty: true });
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
								/>
							)}

							{campaign && !newCampaignMenu && (
								<div className="flex flex-col gap-4">
									<span>{campaign.title}</span>
									<p>{campaign.description}</p>
									<span>{campaign.system.name}</span>
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
												field.onChange(v ?? "offline")
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
									disabled={format === "online"}
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
				<section className="flex w-2/5 flex-col gap-4">
					<TextField title="Предпросмотр" isShrinkable={false}>
						<SessionPreview
							values={
								watchedValues as Partial<CreateSessionInput>
							}
						/>
					</TextField>
					<Button variant={"secondary"} fullWidth csize={"md"}>
						Сохранить черновик
					</Button>
					<Button variant={"primary"} fullWidth csize={"md"}>
						Опубликовать
					</Button>
				</section>
			</form>
		</div>
	);
}
