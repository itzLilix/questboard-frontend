import {
	useController,
	type Control,
	type ControllerRenderProps,
	type FieldPath,
	type FieldValues,
	type RegisterOptions,
} from "react-hook-form";
import { LabeledInput } from "./InputLabel";
import ErrorMessage from "./ErrorMessage";

type FieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
> = {
	name: TName;
	control: Control<TFieldValues>;
	rules?: Omit<
		RegisterOptions<TFieldValues, TName>,
		"valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
	>;
	label?: string;
	children: (
		field: ControllerRenderProps<TFieldValues, TName>,
	) => React.ReactNode;
};

export default function Field<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
>({ name, control, rules, label, children }: FieldProps<TFieldValues, TName>) {
	const { field, fieldState } = useController({ name, control, rules });

	const body = (
		<div className="relative">
			{children(field)}
			<ErrorMessage errMsg={fieldState.error?.message} />
		</div>
	);

	return label ? <LabeledInput label={label}>{body}</LabeledInput> : body;
}
