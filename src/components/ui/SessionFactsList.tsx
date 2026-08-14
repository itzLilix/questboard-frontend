import { Fragment, type ReactNode } from "react";

export type SessionFact = { label: string; value: ReactNode };

export default function SessionFactsList({
	facts,
	placeholder = "—",
}: {
	facts: SessionFact[];
	placeholder?: ReactNode;
}) {
	return (
		<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base">
			{facts.map(({ label, value }) => (
				<Fragment key={label}>
					<dt className="text-(--text-secondary)">{label}</dt>
					<dd className="text-(--text-primary)">
						{value || placeholder}
					</dd>
				</Fragment>
			))}
		</dl>
	);
}
