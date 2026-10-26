import { EPairSide } from "@/enums";
import type { TDefaultShownYearsArgs, TPair, TPairOption, TResolveShownYearsArgs } from "@/types";

/** The pair the other way round — the swap button. */
export function swapPair<T>([a, b]: TPair<T>): TPair<T> {
  return [b, a];
}

/** The pair with one side changed, the other kept. */
export function setPairSide<T>([a, b]: TPair<T>, side: EPairSide, value: T): TPair<T> {
  return side === EPairSide.A ? [value, b] : [a, value];
}

/** A side's options with the other side's value disabled, so both never match. */
export function disableOtherSide<T, O extends TPairOption<T>>(
  options: readonly O[],
  other: T,
): O[] {
  return options.map((option) => (option.value === other ? { ...option, disabled: true } : option));
}

/**
 * The weather years shown as the two diagrams. Default: the first two compared years. A year
 * no longer compared falls back to the first one that isn't on the other side. Null with
 * fewer than two years.
 */
export function resolveYearPair(
  years: readonly number[],
  requested: TPair<number> | null,
): TPair<number> | null {
  const [first, second] = years;
  if (first === undefined || second === undefined) return null;
  const [wantedA, wantedB] = requested ?? [first, second];
  const a = years.includes(wantedA) ? wantedA : (years.find((year) => year !== wantedB) ?? first);
  const b =
    years.includes(wantedB) && wantedB !== a
      ? wantedB
      : (years.find((year) => year !== a) ?? second);
  return [a, b];
}

/**
 * The overlay's years until the reader picks some: Walter-Lieth the side-by-side pair (five
 * overlaid diagrams are hard to read), the standard chart every year.
 */
export function getDefaultShownYears({ years, pair, isWalterLieth }: TDefaultShownYearsArgs) {
  return isWalterLieth && pair !== null ? years.filter((year) => pair.includes(year)) : years;
}

/**
 * The weather years drawn in the overlay: the requested ones still compared, in the page's
 * order; the default when none is requested or none is left.
 */
export function resolveShownYears({
  years,
  requested,
  defaultYears,
}: TResolveShownYearsArgs): readonly number[] {
  const shown = requested === null ? [] : years.filter((year) => requested.includes(year));
  return shown.length > 0 ? shown : years.filter((year) => defaultYears.includes(year));
}

/** Whether two lists hold the same years, in any order. */
export function isSameYears(a: readonly number[], b: readonly number[]) {
  return a.length === b.length && a.every((year) => b.includes(year));
}
