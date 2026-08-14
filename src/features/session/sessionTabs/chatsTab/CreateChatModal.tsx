import clsx from "clsx";
import { useState } from "react";
import AvatarImage from "../../../../components/ui/AvatarImage";
import Icon from "../../../../components/ui/Icon";
import type { IUserBrief } from "../../../../types/userCard";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/inputs/Input";
import { LabeledInput } from "../../../../components/ui/inputs/InputLabel";
import CloseButton from "../../../../components/ui/CloseButton";

export type CreateGroupChatData = {
	memberIds: string[];
	title?: string;
	image?: File;
};

export default function CreateGroupChatModal({
	users,
	currentUserId,
	onClose,
	onCreate,
}: {
	users: Record<string, IUserBrief>;
	currentUserId?: string;
	onClose: () => void;
	onCreate: (data: CreateGroupChatData) => void;
}) {
	const [step, setStep] = useState<1 | 2>(1);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [title, setTitle] = useState("");
	const [image, setImage] = useState<File | undefined>();

	const availableUsers = Object.values(users).filter(
		(user) => user.id !== currentUserId,
	);

	const toggleUser = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const fallbackTitle = selectedIds
		.slice(0, 2)
		.map((id) => users[id]?.displayName)
		.filter(Boolean)
		.join(", ");

	const handleCreate = () => {
		onCreate({
			memberIds: selectedIds,
			title: title.trim() || undefined,
			image,
		});
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--bg-card) shadow-xl">
				{/* Header */}
				<header className="flex items-center justify-between border-b border-(--border) px-5 py-4">
					<div>
						<h2 className="text-2xl font-display text-(--text-primary)">
							Создать групповой чат
						</h2>

						<p className="text-sm text-(--text-secondary)">
							Шаг {step} из 2
						</p>
					</div>

					<CloseButton onClose={onClose} />
				</header>

				{/* Step 1 */}
				{step === 1 && (
					<div className="p-4">
						{/* <p className="mb-3 text-sm text-(--text-secondary)">
							Выберите участников
						</p> */}
						<LabeledInput label="Выберите участников">
							<div className="max-h-80 overflow-y-auto flex flex-col gap-1 py-3">
								{availableUsers.map((user) => {
									const selected = selectedIds.includes(
										user.id,
									);

									return (
										<button
											key={user.id}
											type="button"
											onClick={() => toggleUser(user.id)}
											className={clsx(
												"flex items-center gap-3 rounded-xl p-2 text-left transition-colors cursor-pointer",
												selected
													? "bg-(--bg-elevated)"
													: "hover:bg-(--bg-elevated)",
											)}
										>
											<AvatarImage
												src={user.avatarUrl}
												alt={user.displayName}
												size="md"
											/>

											<span className="min-w-0 flex-1 truncate text-(--text-primary)">
												{user.displayName}
											</span>

											<div
												className={clsx(
													"w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
													selected
														? "bg-(--accent) border-(--accent) text-white"
														: "border-(--border)",
												)}
											>
												{selected && (
													<Icon
														name="check"
														className="text-sm!"
													/>
												)}
											</div>
										</button>
									);
								})}
							</div>
						</LabeledInput>

						<div className="mt-5 flex justify-end">
							<Button
								disabled={selectedIds.length === 0}
								onClick={() => setStep(2)}
								variant={"primary"}
							>
								Далее
							</Button>
						</div>
					</div>
				)}

				{/* Step 2 */}
				{step === 2 && (
					<div className="p-5">
						<div className="flex flex-col items-center gap-4">
							<label className="group relative cursor-pointer">
								<div className="w-24 h-24 rounded-full overflow-hidden border border-(--border) bg-(--bg-elevated) flex items-center justify-center">
									{image ? (
										<img
											src={URL.createObjectURL(image)}
											alt=""
											className="w-full h-full object-cover"
										/>
									) : (
										<Icon
											name="groups"
											className="text-4xl! text-(--text-muted)"
										/>
									)}
								</div>

								<div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Icon
										name="photo_camera"
										className="text-white text-2xl!"
									/>
								</div>

								<Input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={(e) =>
										setImage(e.target.files?.[0])
									}
								/>
							</label>

							<div className="w-full">
								<LabeledInput label="Название">
									<Input
										value={title}
										onChange={(e) =>
											setTitle(
												e.target.value || fallbackTitle,
											)
										}
										placeholder={fallbackTitle}
									/>
								</LabeledInput>
							</div>
						</div>

						<div className="mt-6 flex justify-between">
							<Button onClick={() => setStep(1)}>Назад</Button>

							<Button onClick={handleCreate} variant={"primary"}>
								Создать
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
