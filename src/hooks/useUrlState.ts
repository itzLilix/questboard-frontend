import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Narrow an arbitrary URL string to a known enum value.
 *
 * Accepts either an array of allowed values or a const enum-like object (the
 * `as const` pattern used throughout this codebase) — `Object.values` is run
 * on the object to extract its values.
 *
 * - With `defaultValue`: returns `T`, falling back to the default on miss.
 * - Without: returns `T | null`, returning `null` on miss.
 *
 * @example
 *   // From a const enum object, no default:
 *   const format = parseEnum(params.get("format"), SessionFormat);
 *   //    ^? SessionFormat | null
 *
 *   // With a default (e.g. for sort, where there's always a value):
 *   const sort = parseEnum(params.get("sort"), SessionSortBy, SessionSortBy.ScheduledAt);
 *   //    ^? SessionSortBy
 *
 *   // From a literal array (when you want a subset):
 *   const view = parseEnum(params.get("view"), ["card", "table"] as const, "card");
 */
export function parseEnum<T extends string>(
	input: string | null,
	values: readonly T[] | Readonly<Record<string, T>>,
	defaultValue: T,
): T;
export function parseEnum<T extends string>(
	input: string | null,
	values: readonly T[] | Readonly<Record<string, T>>,
): T | null;
export function parseEnum<T extends string>(
	input: string | null,
	values: readonly T[] | Readonly<Record<string, T>>,
	defaultValue?: T,
): T | null {
	const allowed = Array.isArray(values)
		? (values as readonly T[])
		: Object.values(values as Readonly<Record<string, T>>);
	return allowed.includes(input as T)
		? (input as T)
		: (defaultValue ?? null);
}

/**
 * A patch describes a partial update to the URL search params.
 *
 * - `string`       → `params.set(key, value)`
 * - `string[]`     → repeated `params.append(key, item)` for each non-empty item
 * - `null` / `""`  → `params.delete(key)`
 *
 * Every key in the patch is deleted first, so passing `null` is the canonical
 * way to unset a value, and passing `[]` clears a multi-value key.
 */
export type ParamPatch = Record<string, string | string[] | null>;

/**
 * Low-level hook for treating the URL search params as a piece of state.
 *
 * Returns the current params plus two writers:
 *
 * - `patch(p)` — atomically set/delete many keys in one history-replacing
 *   update. Pass `null` (or `""`) to delete a key; pass an array to write
 *   repeated params (e.g. `?tag=a&tag=b`).
 * - `clear(keep?)` — wipe the search string, optionally preserving the listed
 *   keys (useful for resetting filters while keeping view prefs like `sort`).
 *
 * All writes use `replace: true` so per-keystroke / per-toggle updates don't
 * pollute browser history — back/forward still walks through meaningful
 * navigation events only.
 *
 * Reading is just `params.get(key)` / `params.getAll(key)`. Parsing and
 * defaults are left to the call site so that enums stay exhaustive and TS
 * keeps narrowing.
 *
 * @example
 *   const { params, patch, clear } = useUrlState();
 *   const format = parseFormat(params.get("format"));
 *   patch({ format: nextFormat ?? null });
 *   clear(["sort", "order"]); // reset filters, keep sort prefs
 */
export function useUrlState() {
	const [params, setParams] = useSearchParams();

	const patch = useCallback(
		(p: ParamPatch) => {
			setParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					for (const [key, value] of Object.entries(p)) {
						next.delete(key);
						if (value == null || value === "") continue;
						if (Array.isArray(value)) {
							for (const item of value) {
								if (item) next.append(key, item);
							}
						} else {
							next.set(key, value);
						}
					}
					return next;
				},
				{ replace: true },
			);
		},
		[setParams],
	);

	const clear = useCallback(
		(keep: readonly string[] = []) => {
			setParams(
				(prev) => {
					const next = new URLSearchParams();
					for (const key of keep) {
						for (const value of prev.getAll(key)) {
							next.append(key, value);
						}
					}
					return next;
				},
				{ replace: true },
			);
		},
		[setParams],
	);

	return { params, patch, clear };
}

/**
 * Sugar for the "text input mirrored to a URL param, but debounced" pattern.
 *
 * The component renders `input` and calls `setInput` on every keystroke. After
 * `delay` ms of inactivity the value is written to the URL via {@link useUrlState}.
 * `value` always reflects the URL — read this when building the query payload.
 *
 * External URL changes (back/forward, deep links, programmatic `patch`) sync
 * back into `input` automatically, so the field stays consistent with what
 * the address bar shows.
 *
 * @example
 *   const { input, setInput, value: search } = useUrlSearch("search");
 *
 *   <Input value={input} onChange={(e) => setInput(e.target.value)} />
 *
 *   useSessionsQuery({ search: search || undefined, ... });
 */
export function useUrlSearch(key: string, delay = 300) {
	const { params, patch } = useUrlState();
	const value = params.get(key) ?? "";

	const [input, setInput] = useState(value);

	// Sync URL → input when the URL changes from elsewhere (back/forward, etc.).
	useEffect(() => {
		setInput(value);
	}, [value]);

	// Sync input → URL after the user stops typing for `delay` ms.
	useEffect(() => {
		if (input === value) return;
		const t = setTimeout(() => {
			patch({ [key]: input || null });
		}, delay);
		return () => clearTimeout(t);
	}, [input, value, key, delay, patch]);

	return { input, setInput, value };
}
