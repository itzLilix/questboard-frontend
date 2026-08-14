import { useOutletContext } from "react-router-dom";
import TextField from "../../../components/ui/TextField";
import { SessionFormat, type SessionResponse } from "../../../types/session";
import SessionFactsList from "../../../components/ui/SessionFactsList";
import { splitDatetime } from "../../../utils/dateFormats";
import { AVAILABILITY_LABEL, FORMAT_LABEL } from "../../../utils/words";

export function InfoTab() {
	const [sessionData] = useOutletContext<[SessionResponse]>();
	const { session } = sessionData;
	const { date, time } = splitDatetime(session.scheduledAt);

	return (
		<div className="flex flex-col gap-6">
			<TextField title="Описание" isShrinkable>
				<div className="flex">
					{session.previewUrl && (
						<img
							src={session.previewUrl}
							alt="Session Preview"
							className="rounded-2xl h-full max-w-[40%] object-cover"
						/>
					)}
					<p className="ml-4 text-(--text-primary) wrap-break-word min-w-0">
						{session.description || "Описание отсутствует"}
					</p>
				</div>
			</TextField>
			<TextField title="Детали" isShrinkable>
				<SessionFactsList
					facts={[
						{
							label: "Формат:",
							value: FORMAT_LABEL[session.format],
						},
						{ label: "Дата:", value: date },
						{ label: "Время:", value: time },
						{
							label: "Адрес:",
							value:
								session.format === SessionFormat.Offline
									? session.location?.address
									: null,
						},
						{ label: "Система:", value: session.system?.name },
						{
							label: "Доступность:",
							value: AVAILABILITY_LABEL[session.availability],
						},
					]}
				/>
			</TextField>
		</div>
	);
}
