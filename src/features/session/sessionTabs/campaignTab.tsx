import { Link, useNavigate } from "react-router-dom";
import {
	useCampaignDetailQuery,
	useDeleteCampaignMutation,
	useSaveCampaignMutation,
} from "../queries";
import ListLoading from "../../../components/ui/ListLoading";
import { useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { formatDate } from "../../../utils/dateFormats";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";
import Icon from "../../../components/ui/Icon";
import FilterToggle from "../../../components/ui/filters/FilterToggle";
import {
	CampaignAvailability,
	CampaignStatus,
	type CampaignSessionTie,
} from "../../../types/campaign";
import clsx from "clsx";
import {
	CAMPAIGN_AVAILABILITY_LABEL,
	CAMPAIGN_STATUS_LABEL,
} from "../../../utils/words";
import { useSessionRole } from "../SessionContext";
import Button from "../../../components/ui/Button";
import Dropdown from "../../../components/ui/Dropdown";
import { AccessLevel } from "../access";
import type { UpdateCampaignPayload } from "../api";
import InlineTextArea from "../../../components/ui/inputs/InlineTextArea";
import InlineInput from "../../../components/ui/inputs/InlineInput";
import Field from "../../../components/ui/inputs/Field";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Modifier, type DragOperation } from "@dnd-kit/abstract";

type CampaignEditForm = {
	title: string;
	description: string;
	availability: CampaignAvailability;
	status: CampaignStatus;
	briefs: Record<string, string>;
};

const STATUS_OPTIONS = Object.values(CampaignStatus).map((value) => ({
	value,
	label: CAMPAIGN_STATUS_LABEL[value],
}));

const AVAILABILITY_OPTIONS = Object.values(CampaignAvailability).map(
	(value) => ({
		value,
		label: CAMPAIGN_AVAILABILITY_LABEL[value],
	}),
);

class RestrictToVerticalAxis extends Modifier {
	apply({ transform }: DragOperation) {
		return { ...transform, x: 0 };
	}
}

export function CampaignTab() {
	const { role, sessionData } = useSessionRole();
	const { session, campaign } = sessionData;
	const { data, isLoading } = useCampaignDetailQuery(campaign?.campaignId);
	const navigate = useNavigate();
	const saveMutation = useSaveCampaignMutation();
	const deleteMutation = useDeleteCampaignMutation();

	const { control, handleSubmit, reset, formState } =
		useForm<CampaignEditForm>({
			defaultValues: {
				title: "",
				description: "",
				availability: CampaignAvailability.Open,
				status: CampaignStatus.Active,
				briefs: {},
			},
		});

	const [reversed, setReversed] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [untied, setUntied] = useState<Set<string>>(new Set());
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [orderedIds, setOrderedIds] = useState<string[]>([]);

	const canEdit = role.can(AccessLevel.Edit, true);

	const orderedSessions = useMemo(() => {
		const sorted = [...(data?.sessions ?? [])].sort(
			(a, b) => a.orderIndex - b.orderIndex,
		);
		return reversed && !editMode ? sorted.reverse() : sorted;
	}, [data?.sessions, reversed, editMode]);

	const originalOrder = useMemo(
		() =>
			[...(data?.sessions ?? [])]
				.sort((a, b) => a.orderIndex - b.orderIndex)
				.map((s) => s.sessionId),
		[data?.sessions],
	);

	const tieById = useMemo(() => {
		const map = new Map<string, CampaignSessionTie>();
		for (const s of data?.sessions ?? []) map.set(s.sessionId, s);
		return map;
	}, [data?.sessions]);

	const editTies = orderedIds
		.map((id) => tieById.get(id))
		.filter((tie): tie is CampaignSessionTie => tie !== undefined);

	const reorderPayload = orderedIds.filter((id) => !untied.has(id));
	const originalReorder = originalOrder.filter((id) => !untied.has(id));
	const orderChanged = reorderPayload.some(
		(id, i) => id !== originalReorder[i],
	);

	const isDirty = formState.isDirty || untied.size > 0 || orderChanged;

	const enterEdit = () => {
		const briefs: Record<string, string> = {};
		for (const s of data?.sessions ?? []) {
			briefs[s.sessionId] = s.briefDescription ?? "";
		}
		reset({
			title: data?.title ?? "",
			description: data?.description ?? "",
			availability: data?.availability ?? CampaignAvailability.Open,
			status: data?.status ?? CampaignStatus.Active,
			briefs,
		});
		setUntied(new Set());
		setConfirmingDelete(false);
		setOrderedIds(originalOrder);
		setEditMode(true);
	};

	const cancelEdit = () => {
		setEditMode(false);
		setUntied(new Set());
		setConfirmingDelete(false);
		setOrderedIds([]);
		reset();
	};

	const toggleUntie = (sessionId: string) => {
		setUntied((prev) => {
			const next = new Set(prev);
			if (next.has(sessionId)) next.delete(sessionId);
			else next.add(sessionId);
			return next;
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (event.canceled) return;
		const { source } = event.operation;
		if (!isSortable(source)) return;
		setOrderedIds((ids) => {
			const from = ids.indexOf(String(source.id));
			const to = source.index;
			if (from === -1 || to === from || to < 0 || to >= ids.length)
				return ids;
			const next = [...ids];
			const [moved] = next.splice(from, 1);
			next.splice(to, 0, moved);
			return next;
		});
	};

	const onSubmit = async (values: CampaignEditForm) => {
		if (!campaign?.campaignId || !data) return;
		const unties = [...untied];
		const briefEdits = data.sessions
			.filter((s) => !untied.has(s.sessionId))
			.filter(
				(s) =>
					(values.briefs[s.sessionId] ?? "") !==
					(s.briefDescription ?? ""),
			)
			.map((s) => ({
				sessionId: s.sessionId,
				briefDescription: values.briefs[s.sessionId] ?? "",
			}));

		const campaignPatch: UpdateCampaignPayload = {};
		if (values.title !== data.title) campaignPatch.title = values.title;
		if ((values.description ?? "") !== (data.description ?? ""))
			campaignPatch.description = values.description;
		if (values.availability !== data.availability)
			campaignPatch.availability = values.availability;
		const status =
			values.status !== data.status ? values.status : undefined;

		const hasCampaignPatch = Object.keys(campaignPatch).length > 0;
		const reorder = orderChanged ? reorderPayload : undefined;
		if (
			unties.length === 0 &&
			briefEdits.length === 0 &&
			!hasCampaignPatch &&
			!status &&
			!reorder
		) {
			return;
		}

		try {
			await saveMutation.mutateAsync({
				campaignId: campaign.campaignId,
				unties,
				reorder,
				briefEdits,
				campaignPatch: hasCampaignPatch ? campaignPatch : undefined,
				status,
			});
			cancelEdit();
		} catch {
			// surfaced via saveMutation.isError below
		}
	};

	const doDelete = async () => {
		if (!campaign?.campaignId) return;
		try {
			await deleteMutation.mutateAsync(campaign.campaignId);
			navigate(`/sessions/${session.id}/info`, { replace: true });
		} catch {
			// surfaced via deleteMutation.isError below
		}
	};

	if (isLoading) {
		return <ListLoading />;
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-1">
				<div className="flex gap-3 items-center">
					<span className="flex-1 min-w-0 text-base font-body text-(--text-secondary)">
						{editMode ? (
							<Controller
								name="title"
								control={control}
								render={({ field }) => (
									<InlineInput
										className="font-display text-2xl text-(--text-primary)"
										value={field.value}
										onChange={field.onChange}
										maxLength={120}
										placeholder="Название кампейна"
									/>
								)}
							/>
						) : (
							<h2 className="font-display text-2xl text-(--text-primary)">
								{campaign?.title}
							</h2>
						)}
						{editMode ? (
							<span className="inline-flex items-center gap-1">
								<Controller
									name="availability"
									control={control}
									render={({ field }) => (
										<InlineEnumDropdown
											value={field.value}
											options={AVAILABILITY_OPTIONS}
											onChange={field.onChange}
										>
											<span>
												{
													CAMPAIGN_AVAILABILITY_LABEL[
														field.value
													]
												}
											</span>
										</InlineEnumDropdown>
									)}
								/>
								{", "}
								<Controller
									name="status"
									control={control}
									render={({ field }) => (
										<InlineEnumDropdown
											value={field.value}
											options={STATUS_OPTIONS}
											onChange={field.onChange}
										>
											<CampaignStatusBadge
												status={field.value}
											/>
										</InlineEnumDropdown>
									)}
								/>
							</span>
						) : (
							<>
								<span>
									{
										CAMPAIGN_AVAILABILITY_LABEL[
											data!.availability
										]
									}
								</span>
								{", "}
								<CampaignStatusBadge status={data!.status} />
							</>
						)}
					</span>
					<nav className="flex items-center justify-end gap-3">
						{canEdit && !editMode && (
							<Button onClick={enterEdit}>
								<Icon name="edit" className="text-base! pr-2" />{" "}
								Редактировать
							</Button>
						)}
						{canEdit && editMode && (
							<>
								{confirmingDelete ? (
									<>
										<span className="text-sm text-(--text-secondary)">
											Удалить кампейн?
										</span>
										<Button
											onClick={() =>
												setConfirmingDelete(false)
											}
											disabled={deleteMutation.isPending}
										>
											Нет
										</Button>
										<Button
											variant="primary"
											className="bg-(--error)! hover:bg-(--error)!"
											onClick={doDelete}
											disabled={deleteMutation.isPending}
										>
											{deleteMutation.isPending
												? "Удаление..."
												: "Да, удалить"}
										</Button>
									</>
								) : (
									<>
										<Button
											className="text-(--error)!"
											onClick={() =>
												setConfirmingDelete(true)
											}
										>
											<Icon
												name="delete"
												className="text-base! pr-2"
											/>{" "}
											Удалить
										</Button>
										<Button
											onClick={cancelEdit}
											disabled={saveMutation.isPending}
										>
											Отмена
										</Button>
										<Button
											variant="primary"
											onClick={handleSubmit(onSubmit)}
											disabled={
												!isDirty ||
												saveMutation.isPending
											}
										>
											{saveMutation.isPending
												? "Сохранение..."
												: "Сохранить"}
										</Button>
									</>
								)}
							</>
						)}
						{!editMode && orderedSessions.length > 1 && (
							<FilterToggle
								onChange={() => setReversed((r) => !r)}
								className="gap-2"
								isActive={false}
							>
								<Icon name="swap_vert" className="text-xl!" />
							</FilterToggle>
						)}
					</nav>
				</div>
				{editMode ? (
					<Controller
						name="description"
						control={control}
						render={({ field }) => (
							<InlineTextArea
								className="text-(--text-secondary) text-base"
								value={field.value ?? ""}
								onChange={field.onChange}
								maxLength={500}
								placeholder="Нет описания"
							/>
						)}
					/>
				) : (
					<p className="text-(--text-secondary) text-base wrap-break-word pt-2">
						{data?.description ?? "Нет описания"}
					</p>
				)}
				{(saveMutation.isError || deleteMutation.isError) && (
					<p className="text-sm text-(--error)">
						Не удалось сохранить изменения
					</p>
				)}
			</div>
			<div className="flex flex-col border-l-4 border-(--accent)">
				{editMode ? (
					<DragDropProvider
						modifiers={[RestrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
					>
						{editTies.map((s, index) => (
							<SortableSessionRow
								key={s.sessionId}
								tie={s}
								index={index}
								linkTo={`/sessions/${s.sessionId}`}
								isUntied={untied.has(s.sessionId)}
								onToggleUntie={toggleUntie}
								control={control}
							/>
						))}
					</DragDropProvider>
				) : (
					orderedSessions.map((s) => (
						<SessionTieRow
							key={s.sessionId}
							tie={s}
							linkTo={`/sessions/${s.sessionId}`}
							editMode={false}
							isUntied={false}
							onToggleUntie={toggleUntie}
							control={control}
						/>
					))
				)}
			</div>
		</div>
	);
}

type SessionTieRowProps = {
	tie: CampaignSessionTie;
	linkTo: string;
	editMode: boolean;
	isUntied: boolean;
	onToggleUntie: (sessionId: string) => void;
	control: Control<CampaignEditForm>;
	containerRef?: (element: Element | null) => void;
	isDragging?: boolean;
	dragHandle?: ReactNode;
};

function SessionTieRow({
	tie,
	linkTo,
	editMode,
	isUntied,
	onToggleUntie,
	control,
	containerRef,
	isDragging,
	dragHandle,
}: SessionTieRowProps) {
	return (
		<div
			ref={containerRef}
			className={clsx(
				" pl-4 pb-4 relative",
				isUntied && "opacity-50",
				isDragging && "opacity-60",
			)}
		>
			<div className="absolute -left-2 top-1 w-3 h-3 rounded-full bg-(--accent)"></div>
			<CollapsibleSection
				title={
					"#" +
					tie.orderIndex +
					" / " +
					formatDate(tie.cachedScheduledAt)
				}
			>
				<div className="bg-(--bg-card) rounded-lg p-4 border border-(--border) text-base font-body flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Link
							to={linkTo}
							className={clsx(
								"text-(--text-primary) font-display text-xl",
								isUntied && "line-through",
							)}
						>
							{tie.cachedTitle}
						</Link>
						{editMode && (
							<button
								type="button"
								onClick={() => onToggleUntie(tie.sessionId)}
								title={isUntied ? "Вернуть" : "Отвязать"}
								className="text-(--text-muted) hover:text-(--error) transition-colors cursor-pointer"
							>
								<Icon name={isUntied ? "undo" : "link_off"} />
							</button>
						)}
						{dragHandle}
					</div>
					{editMode && !isUntied ? (
						<Field
							name={`briefs.${tie.sessionId}`}
							control={control}
						>
							{(field) => (
								<InlineTextArea
									className="text-(--text-secondary)"
									value={field.value ?? ""}
									onChange={field.onChange}
									placeholder="Описание отсутствует"
									maxLength={1000}
								/>
							)}
						</Field>
					) : (
						<p className="text-(--text-secondary) min-w-0 wrap-break-word">
							{tie.briefDescription ?? "Описание отсутствует"}
						</p>
					)}
				</div>
			</CollapsibleSection>
		</div>
	);
}

function SortableSessionRow({
	tie,
	index,
	linkTo,
	isUntied,
	onToggleUntie,
	control,
}: {
	tie: CampaignSessionTie;
	index: number;
	linkTo: string;
	isUntied: boolean;
	onToggleUntie: (sessionId: string) => void;
	control: Control<CampaignEditForm>;
}) {
	const { ref, handleRef, isDragging } = useSortable({
		id: tie.sessionId,
		index,
	});
	return (
		<SessionTieRow
			tie={tie}
			linkTo={linkTo}
			editMode
			isUntied={isUntied}
			onToggleUntie={onToggleUntie}
			control={control}
			containerRef={ref}
			isDragging={isDragging}
			dragHandle={
				!isUntied && (
					<button
						ref={handleRef}
						type="button"
						aria-label="Перетащить"
						className="ml-auto shrink-0 text-(--text-muted) hover:text-(--text-secondary) cursor-grab active:cursor-grabbing touch-none"
					>
						<Icon name="drag_indicator" />
					</button>
				)
			}
		/>
	);
}

function InlineEnumDropdown({
	value,
	options,
	onChange,
	children,
}: {
	value: string;
	options: readonly { value: string; label: string }[];
	onChange: (value: string) => void;
	children: ReactNode;
}) {
	return (
		<Dropdown
			label=""
			className="inline-flex"
			options={options}
			value={value}
			onChange={(v) => v && onChange(v)}
			renderTrigger={({ isOpen, toggle }) => (
				<button
					type="button"
					onClick={toggle}
					className="inline-flex items-center gap-0.5 cursor-pointer text-(--text-secondary) hover:text-(--text-primary) transition-colors"
				>
					{children}
					<Icon
						name="expand_more"
						className={clsx(
							"text-base! text-(--text-muted)! transition-transform duration-200",
							isOpen && "rotate-180",
						)}
					/>
				</button>
			)}
		/>
	);
}

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
	return (
		<span
			className={clsx("text-base font-body", {
				"text-(--success)": status === CampaignStatus.Active,
				"text-yellow-800": status === CampaignStatus.Paused,
				"text-red-800": status === CampaignStatus.Cancelled,
				"text-gray-500": status === CampaignStatus.Completed,
			})}
		>
			{CAMPAIGN_STATUS_LABEL[status]}
		</span>
	);
}
