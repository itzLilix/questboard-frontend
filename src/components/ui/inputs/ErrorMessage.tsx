export default function ErrorMessage({
	errMsg,
}: {
	errMsg: string | undefined;
}) {
	return (
		errMsg && (
			<span className="absolute text-center left-0 top-full text-sm text-(--error) pt-1 w-full">
				{errMsg}
			</span>
		)
	);
}
