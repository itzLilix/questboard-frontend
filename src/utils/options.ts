/**
 * A select/dropdown option. The `value` is generic so callers can preserve
 * literal types and derive a union from them.
 */
export type Option<V extends string = string> = {
	value: V;
	label: string;
};

/**
 * Wraps a readonly options array so TS preserves the literal types of `value`
 * without sprinkling `as const satisfies readonly Option[]` at every call site.
 *
 * @example
 *   const SORT_OPTIONS = options([
 *     { value: "rating", label: "Рейтинг" },
 *     { value: "recent", label: "Регистрация" },
 *   ]);
 *   type SortKey = OptionValue<typeof SORT_OPTIONS>; // "rating" | "recent"
 *
 *   // To constrain values to a pre-existing union, chain `satisfies`:
 *   const FORMAT_OPTIONS = options([
 *     { value: "online", label: "Онлайн" },
 *     { value: "offline", label: "Оффлайн" },
 *   ]) satisfies readonly Option<SessionFormat>[];
 */
export function options<const T extends readonly Option[]>(opts: T): T {
	return opts;
}

/** Extracts the union of `value` literals from an options array. */
export type OptionValue<T extends readonly Option[]> = T[number]["value"];
