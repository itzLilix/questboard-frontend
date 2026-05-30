import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/inputs/Field";
import Input from "../../components/ui/inputs/Input";
import InputText from "../../components/ui/inputs/InputText";
import { LabeledInput } from "../../components/ui/inputs/InputLabel";
import { Controller } from "react-hook-form";
import type { ISystem } from "../../types/userCard";
import SystemSearch from "./SystemSearch";
import { CampaignAvailability } from "../../types/campaign";
import { options } from "../../utils/options";
import Dropdown from "../../components/ui/Dropdown";

export interface CreateCampaignInput {
	title: string;
	description: string;
	system: ISystem | null;
	availability: CampaignAvailability;
}

type NewCampaignPopoverProps = {
	onConfirm: (data: CreateCampaignInput) => void;
	onClose: () => void;
	className?: string;
};

const titleRules = {
	required: "Название обязательно",
	maxLength: { value: 120, message: "Максимум 120 символов" },
};

const AVAILABILITY_OPTIONS = options([
	{ value: CampaignAvailability.Open, label: "Публичный" },
	{ value: CampaignAvailability.Private, label: "Приватный" },
]);

export default function NewCampaignPopover({
	onConfirm,
	onClose,
}: NewCampaignPopoverProps) {
	const { control, handleSubmit, reset } = useForm<CreateCampaignInput>({
		mode: "onSubmit",
		defaultValues: {
			title: "",
			description: "",
			system: null,
			availability: CampaignAvailability.Open,
		},
	});

	const onSubmit = (data: CreateCampaignInput) => {
		onConfirm(data);
		reset();
		onClose();
	};

	return (
		<>
			<div className="mt-2 flex flex-col gap-4">
				<h3 className="text-xl font-display text-(--text-secondary)">
					Новый кампейн
				</h3>

				<div className="grid grid-cols-2 gap-4">
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
								maxLength={120}
								autoFocus
							/>
						)}
					</Field>
					<LabeledInput label="Доступность">
						<Controller
							name="availability"
							control={control}
							render={({ field }) => (
								<Dropdown
									label=""
									options={AVAILABILITY_OPTIONS}
									value={field.value}
									onChange={(v) =>
										field.onChange(
											v ?? CampaignAvailability.Open,
										)
									}
									fullWidth
								/>
							)}
						/>
					</LabeledInput>
				</div>

				<Field name="description" control={control} label="Описание">
					{(field) => (
						<InputText
							{...field}
							className="w-full"
							maxLength={500}
						/>
					)}
				</Field>

				<LabeledInput label="Система">
					<p className="text-xs text-(--text-muted) mb-1">
						Будет автоматически применена ко всем сессиям кампейна
					</p>
					<Controller
						name="system"
						control={control}
						render={({ field }) => (
							<SystemSearch
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				</LabeledInput>

				<div className="flex gap-2 justify-end pt-1">
					<Button
						type="button"
						variant="secondary"
						csize="sm"
						onClick={() => {
							reset();
							onClose();
						}}
					>
						Отмена
					</Button>
					<Button
						type="button"
						variant="primary"
						csize="sm"
						onClick={handleSubmit(onSubmit)}
					>
						Создать
					</Button>
				</div>
			</div>
		</>
	);
}
