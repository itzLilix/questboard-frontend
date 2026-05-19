import Loading from "../../components/ui/Loading";
import SessionCard from "../../components/ui/cards/SessionCard";
import type { ISession, ISessionCard } from "../../types/session";
import { useSessionsQuery } from "./queries";

export default function SessionsPage() {
	const { data, isLoading, isError } = useSessionsQuery({
		status: "public",
		limit: 20,
	});

	return (
		<div className="max-w-1600 mx-auto px-4 py-6">
			<h1 className="font-display text-3xl text-(--text-primary) mb-6">
				Сессии
			</h1>
			<SessionsList
				items={data?.items}
				isLoading={isLoading}
				isError={isError}
			/>
		</div>
	);
}

export function SessionsList({
	items,
	isLoading,
	isError,
}: {
	items?: ISession[];
	isLoading: boolean;
	isError: boolean;
}) {
	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loading />
			</div>
		);
	}
	if (isError) {
		return (
			<p className="text-(--error) text-center py-12">Ошибка загрузки</p>
		);
	}
	if (!items || items.length === 0) {
		return (
			<p className="text-(--text-muted) text-center py-12 w-full">
				Сессий нет
			</p>
		);
	}
	return (
		<div className="flex flex-wrap gap-4">
			{items.map((s) => (
				<SessionCard key={s.id} sessionData={toSessionCard(s)} />
			))}
		</div>
	);
}

function toSessionCard(s: ISession): ISessionCard {
	return { ...s, masterDisplayName: "" };
}
