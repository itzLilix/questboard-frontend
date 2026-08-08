import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { SessionFormat, type ILocation } from "../../types/session";
import {
	useCampaignsQuery,
	useCreateCampaignMutation,
	useCreateSessionMutation,
} from "./queries";
import type { CreateSessionPayload } from "./api";
import type { CreateCampaignInput } from "./NewCampaignPopover";
import SessionFactsList from "./SessionFactsList";
import SessionFormFields from "./SessionFormFields";
import CampaignTieField from "./CampaignTieField";
import { sessionFormDefaults, type SessionFormValues } from "./sessionForm";
import { formatDate, timeAddTz } from "../../utils/dateFormats";
import { AVAILABILITY_OPTIONS, FORMAT_OPTIONS } from "../../utils/words";
import { CampaignStatus, type ICampaign } from "../../types/campaign";
import useAuth from "../auth/AuthProvider";

function SessionPreview({
	values,
	campaign,
}: {
	values: Partial<SessionFormValues>;
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
					{ label: "Адрес:", value: values.location || null },
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
		useForm<SessionFormValues>({
			mode: "onTouched",
			defaultValues: sessionFormDefaults,
		});

	const watchedValues = useWatch({ control });
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
		data: SessionFormValues,
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

		const address = data.location.trim();
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
		(publish: boolean): SubmitHandler<SessionFormValues> =>
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
		const created = await createCampaign.mutateAsync({
			title: data.title.trim(),
			description: data.description?.trim() || undefined,
			availability: data.availability,
			systemId: data.system?.id || undefined,
		});
		setValue("campaignId", created.id, { shouldDirty: true });
		if (created.system && !watch("system")) {
			setValue("system", created.system, { shouldDirty: true });
		}
	};

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Создать сессию
			</h1>
			<form className="flex w-full gap-6">
				<section className="flex flex-1 flex-col gap-4 min-w-0">
					<CampaignTieField
						control={control}
						options={campaignOptions}
						selectedCampaign={campaign}
						newCampaignMenu={newCampaignMenu}
						onToggleNewCampaign={() => toggleNewCampaign((o) => !o)}
						onCampaignCreated={handleCampaignCreated}
						onDraftDirtyChange={setCampaignDraftDirty}
						onEndReached={() => {
							if (
								campaignsQuery.hasNextPage &&
								!campaignsQuery.isFetchingNextPage
							) {
								campaignsQuery.fetchNextPage();
							}
						}}
					/>
					<SessionFormFields
						control={control}
						register={register}
						setValue={setValue}
						lockedSystem={campaign?.system ?? null}
					/>
				</section>
				<section className="flex w-2/5 flex-col gap-4 sticky top-(--header-h) pt-6 self-start">
					<TextField title="Предпросмотр" isShrinkable={false}>
						<SessionPreview
							values={watchedValues as Partial<SessionFormValues>}
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
