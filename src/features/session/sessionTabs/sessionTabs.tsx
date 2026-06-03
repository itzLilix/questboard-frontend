type PlaceholderProps = { title: string; hint?: string };

function Placeholder({ title, hint }: PlaceholderProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
			<h2 className="font-display text-2xl text-(--text-primary)">
				{title}
			</h2>
			{hint && (
				<p className="font-body text-base text-(--text-muted) max-w-md">
					{hint}
				</p>
			)}
		</div>
	);
}

export function ChatTab() {
	return (
		<Placeholder
			title="Чат"
			hint="Переписка участников сессии. Доступно мастеру и игрокам."
		/>
	);
}

export function PlayTab() {
	return (
		<Placeholder
			title="Сессия"
			hint="Инструменты для игры — инициатива, броски, треки. Доступно мастеру и игрокам."
		/>
	);
}

export function VTTTab() {
	return (
		<Placeholder
			title="VTT"
			hint="Виртуальный игровой стол. Доступно мастеру и игрокам."
		/>
	);
}

export function NotesTab() {
	return (
		<Placeholder
			title="Заметки"
			hint="Личные заметки участника. Каждый видит только свои — изолировано на бэкенде."
		/>
	);
}

