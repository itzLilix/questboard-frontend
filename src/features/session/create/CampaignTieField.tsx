import { Controller, type Control } from "react-hook-form";
import TextField from "../../../components/ui/TextField";
import { LabeledInput } from "../../../components/ui/inputs/InputLabel";
import Dropdown, { type DropdownOption } from "../../../components/ui/Dropdown";
import Button from "../../../components/ui/Button";
import { SystemBadge } from "../../../components/ui/SystemBadge";
import NewCampaignPopover, {
	type CreateCampaignInput,
} from "./NewCampaignPopover";
import type { ICampaign } from "../../../types/campaign";
import type { SessionFormValues } from "./sessionForm";

type CampaignTieFieldProps = {
	control: Control<SessionFormValues>;
	options: readonly DropdownOption[];
	selectedCampaign?: ICampaign;
	newCampaignMenu: boolean;
	onToggleNewCampaign: () => void;
	onCampaignCreated: (data: CreateCampaignInput) => Promise<void>;
	onDraftDirtyChange?: (dirty: boolean) => void;
	onEndReached?: () => void;
};

export default function CampaignTieField({
	control,
	options,
	selectedCampaign,
	newCampaignMenu,
	onToggleNewCampaign,
	onCampaignCreated,
	onDraftDirtyChange,
	onEndReached,
}: CampaignTieFieldProps) {
	return (
		<TextField title="Кампейн" isShrinkable={false}>
			<LabeledInput label="Привязать к кампейну">
				<div className="flex gap-4">
					<Controller
						name="campaignId"
						control={control}
						render={({ field }) => (
							<Dropdown
								label=""
								options={options}
								value={field.value ?? ""}
								onChange={(v) =>
									field.onChange(v === "" ? null : v)
								}
								disabled={newCampaignMenu}
								placeholder="Одиночная сессия"
								fullWidth
								className="flex-1"
								onEndReached={onEndReached}
							/>
						)}
					/>

					<Button
						type="button"
						variant="secondary"
						onClick={onToggleNewCampaign}
					>
						+ Новый кампейн
					</Button>
				</div>

				{newCampaignMenu && (
					<NewCampaignPopover
						onConfirm={onCampaignCreated}
						onClose={onToggleNewCampaign}
						onDirtyChange={onDraftDirtyChange}
					/>
				)}

				{selectedCampaign && !newCampaignMenu && (
					<div className="flex flex-col gap-4 mt-4">
						<div className="inline-flex gap-3 items-center">
							<span className="text-2xl font-display text-(--text-primary)">
								{selectedCampaign.title}
							</span>
							{selectedCampaign.system && (
								<SystemBadge system={selectedCampaign.system} />
							)}
						</div>
						<p className="text-(--text-secondary) text-base wrap-break-word">
							{selectedCampaign.description ?? "Нет описания"}
						</p>
					</div>
				)}
			</LabeledInput>
		</TextField>
	);
}
