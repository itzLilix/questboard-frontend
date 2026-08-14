import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import TextField from "../../../components/ui/TextField";
import Button from "../../../components/ui/Button";
import Dropdown from "../../../components/ui/Dropdown";
import Icon from "../../../components/ui/Icon";
import SessionFormFields from "../create/SessionFormFields";
import CampaignTieField from "../create/CampaignTieField";
import { type SessionFormValues } from "../create/sessionForm";
import {
	useCampaignsQuery,
	useCreateCampaignMutation,
	useDeleteSessionMutation,
	useSaveSessionMutation,
} from "../queries";
import type { UpdateSessionPayload } from "../api";
import type { CreateCampaignInput } from "../create/NewCampaignPopover";
import {
	SessionFormat,
	type SessionResponse,
	type SessionStatus,
} from "../../../types/session";
import { CampaignStatus, type ICampaign } from "../../../types/campaign";
import {
	combineDateTime,
	dateKey,
	splitDatetime,
} from "../../../utils/dateFormats";
import { SESSION_STATUS_OPTIONS } from "../../../utils/words";

function EditTabForm({ sessionData }: { sessionData: SessionResponse }) {
	const { session, campaign: tied } = sessionData;
	const navigate = useNavigate();

	const gmUsername = sessionData.users[session.masterId]?.username ?? "";

	const saveMutation = useSaveSessionMutation();
	const deleteMutation = useDeleteSessionMutation();
	const createCampaign = useCreateCampaignMutation();
	const campaignsQuery = useCampaignsQuery({
		masterId: session.masterId,
		status: CampaignStatus.Active,
	});
	const campaigns = campaignsQuery.data?.pages.flatMap((p) => p.items) ?? [];

	const [status, setStatus] = useState<SessionStatus>(session.status);
	const [newCampaignMenu, toggleNewCampaign] = useState(false);
	const [campaignDraftDirty, setCampaignDraftDirty] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const defaultValues = useMemo<SessionFormValues>(() => {
		const { time } = splitDatetime(session.scheduledAt);
		const dk = dateKey(session.scheduledAt);
		return {
			campaignId: tied?.campaignId ?? null,
			title: session.title,
			description: session.description ?? "",
			image: null,
			system: session.system,
			format: session.format,
			location: session.location?.address ?? "",
			scheduledAt: dk === "—" ? "" : dk,
			startTime: time === "—" ? "" : time,
			durationHours: session.duration ?? 4,
			maxSeats: session.maxSeats,
			price: session.price === 0 ? "" : String(session.price),
			isFree: session.price === 0,
			availability: session.availability,
		};
	}, [session, tied]);

	const {
		control,
		handleSubmit,
		register,
		setValue,
		watch,
		reset,
		formState,
	} = useForm<SessionFormValues>({
		mode: "onTouched",
		defaultValues,
	});

	const campaignId = watch("campaignId");
	const selectedCampaign = campaigns.find((c) => c.id === campaignId);
	const lockedSystem = selectedCampaign?.system ?? null;

	const campaignOptions = [
		{ value: "", label: "Одиночная сессия" },
		...campaigns.map((c: ICampaign) => ({ value: c.id, label: c.title })),
	];
	if (tied && !campaigns.some((c) => c.id === tied.campaignId)) {
		campaignOptions.splice(1, 0, {
			value: tied.campaignId,
			label: tied.title,
		});
	}

	const buildPatch = (v: SessionFormValues): UpdateSessionPayload => {
		const patch: UpdateSessionPayload = {};

		const title = v.title.trim();
		if (title !== session.title) patch.title = title;

		const description = v.description.trim();
		if (description !== (session.description ?? ""))
			patch.description = description;

		if (v.format !== session.format) patch.format = v.format;

		const systemId = lockedSystem?.id ?? v.system?.id;
		if (systemId && systemId !== session.system?.id)
			patch.systemId = systemId;

		const address =
			v.format === SessionFormat.Offline ? v.location.trim() : "";
		if (address !== (session.location?.address ?? ""))
			patch.address = address;

		const iso = combineDateTime(v.scheduledAt, v.startTime);
		if (
			iso &&
			(!session.scheduledAt ||
				new Date(iso).getTime() !==
					new Date(session.scheduledAt).getTime())
		)
			patch.scheduledAt = iso;

		if (v.durationHours !== (session.duration ?? 4))
			patch.durationHours = v.durationHours;

		if (v.maxSeats !== session.maxSeats) patch.maxSeats = v.maxSeats;

		const price = v.isFree ? 0 : Number(v.price || 0);
		if (price !== session.price) patch.price = price;

		if (v.availability !== session.availability)
			patch.availability = v.availability;

		return patch;
	};

	const statusDirty = status !== session.status;
	const isDirty = formState.isDirty || statusDirty;

	const onSave = (v: SessionFormValues) => {
		setError(null);
		if (newCampaignMenu && campaignDraftDirty) {
			setError(
				"Завершите создание нового кампейна или очистите его поля перед сохранением.",
			);
			return;
		}

		const patch = buildPatch(v);
		const statusChange = statusDirty ? status : undefined;
		const from = tied?.campaignId ?? null;
		const to = v.campaignId ?? null;
		const campaignChange = from !== to ? { from, to } : undefined;

		if (
			Object.keys(patch).length === 0 &&
			!statusChange &&
			!campaignChange
		) {
			return;
		}

		saveMutation.mutate(
			{
				sessionId: session.id,
				gmUsername,
				patch: Object.keys(patch).length > 0 ? patch : undefined,
				status: statusChange,
				campaignChange,
			},
			{
				onError: () =>
					setError(
						"Не удалось сохранить изменения. Попробуйте ещё раз.",
					),
				onSuccess: () => reset(v),
			},
		);
	};

	const onDelete = () => {
		setError(null);
		deleteMutation.mutate(
			{ sessionId: session.id, gmUsername },
			{
				onSuccess: () => navigate("/sessions"),
				onError: () =>
					setError("Не удалось удалить сессию. Попробуйте ещё раз."),
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

	const onCancel = () => {
		reset(defaultValues);
		setStatus(session.status);
		setError(null);
		setConfirmingDelete(false);
	};

	const saving = saveMutation.isPending;
	const deleting = deleteMutation.isPending;

	return (
		<form className="flex flex-col gap-4">
			<TextField title="Статус" isShrinkable={false}>
				<Dropdown
					label=""
					options={SESSION_STATUS_OPTIONS}
					value={status}
					onChange={(v) => v && setStatus(v as SessionStatus)}
					fullWidth
				/>
			</TextField>

			<CampaignTieField
				control={control}
				options={campaignOptions}
				selectedCampaign={selectedCampaign}
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
				lockedSystem={lockedSystem}
			/>

			<nav className="sticky bottom-0 bg-(--bg-base) pt-4 px-6 transform border-t border-(--border)">
				<div className="flex items-center justify-between gap-3">
					{confirmingDelete ? (
						<div className="flex items-center gap-3">
							<span className="text-sm text-(--text-secondary)">
								Удалить сессию?
							</span>
							<Button
								onClick={() => setConfirmingDelete(false)}
								disabled={deleting}
							>
								Нет
							</Button>
							<Button
								variant="primary"
								className="bg-(--error)! hover:bg-(--error)!"
								onClick={onDelete}
								disabled={deleting}
							>
								{deleting ? "Удаление..." : "Да, удалить"}
							</Button>
						</div>
					) : (
						<Button
							className="text-(--error)!"
							onClick={() => setConfirmingDelete(true)}
							disabled={saving}
						>
							<Icon name="delete" className="text-base! pr-2" />
							Удалить
						</Button>
					)}

					<div className="flex items-center gap-3">
						<Button
							onClick={onCancel}
							disabled={!isDirty || saving}
						>
							Отмена
						</Button>
						<Button
							variant="primary"
							onClick={handleSubmit(onSave)}
							disabled={!isDirty || saving}
						>
							{saving ? "Сохранение..." : "Сохранить"}
						</Button>
					</div>
				</div>
				{error && (
					<p className="text-sm text-(--error) text-center">
						{error}
					</p>
				)}
			</nav>
		</form>
	);
}

export function EditTab() {
	const [sessionData] = useOutletContext<[SessionResponse]>();

	return <EditTabForm sessionData={sessionData} />;
}
