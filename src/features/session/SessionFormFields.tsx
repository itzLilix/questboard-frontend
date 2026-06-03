import {
	Controller,
	useWatch,
	type Control,
	type UseFormRegister,
	type UseFormSetValue,
} from "react-hook-form";
import TextField from "../../components/ui/TextField";
import Input from "../../components/ui/inputs/Input";
import InputText from "../../components/ui/inputs/InputText";
import Field from "../../components/ui/inputs/Field";
import { LabeledInput } from "../../components/ui/inputs/InputLabel";
import Dropdown from "../../components/ui/Dropdown";
import FilterToggle from "../../components/ui/filters/FilterToggle";
import ImageUploader from "../settings/ImageUploader";
import SystemSearch from "./SystemSearch";
import { SessionFormat } from "../../types/session";
import type { ISystem } from "../../types/userCard";
import { AVAILABILITY_OPTIONS, FORMAT_OPTIONS } from "../../utils/words";
import {
	descriptionRules,
	seatsRules,
	titleRules,
	type SessionFormValues,
} from "./sessionForm";

type SessionFormFieldsProps = {
	control: Control<SessionFormValues>;
	register: UseFormRegister<SessionFormValues>;
	setValue: UseFormSetValue<SessionFormValues>;
	/** When the session inherits its system from a campaign, lock the field. */
	lockedSystem?: ISystem | null;
	currentImageUrl?: string;
};

export default function SessionFormFields({
	control,
	register,
	setValue,
	lockedSystem,
	currentImageUrl,
}: SessionFormFieldsProps) {
	const isFree = useWatch({ control, name: "isFree" });
	const availability = useWatch({ control, name: "availability" });
	const format = useWatch({ control, name: "format" });

	return (
		<>
			<TextField title="Основное" isShrinkable={false}>
				<LabeledInput label="Система">
					<Controller
						name="system"
						control={control}
						render={({ field }) => (
							<SystemSearch
								value={lockedSystem ?? field.value}
								onChange={field.onChange}
								disabled={lockedSystem != null}
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
								currentUrl={currentImageUrl}
								file={field.value}
								onChange={field.onChange}
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
									setValue("isFree", e.target.checked, {
										shouldDirty: true,
									});
									if (e.target.checked) setValue("price", "");
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
									setValue("availability", opt.value, {
										shouldDirty: true,
									})
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
		</>
	);
}
