import { EPairSide } from "@/enums";
import type { TDefaultShownYearsArgs, TPair, TPairOption, TResolveShownYearsArgs } from "@/types";

export function swapPair<T>([a, b]: TPair<T>): TPair<T> {
  return [b, a];
}

export function setPairSide<T>([a, b]: TPair<T>, side: EPairSide, value: T): TPair<T> {
  return side === EPairSide.A ? [value, b] : [a, value];
}

export function disableOtherSide<T, O extends TPairOption<T>>(
  options: readonly O[],
  other: T,
): O[] {
  return options.map((option) => (option.value === other ? { ...option, disabled: true } : option));
}

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

/** Walter-Lieth: the side-by-side pair, since five overlaid diagrams are hard to read */
export function getDefaultShownYears({ years, pair, isWalterLieth }: TDefaultShownYearsArgs) {
  return isWalterLieth && pair !== null ? years.filter((year) => pair.includes(year)) : years;
}

export function resolveShownYears({
  years,
  requested,
  defaultYears,
}: TResolveShownYearsArgs): readonly number[] {
  const shown = requested === null ? [] : years.filter((year) => requested.includes(year));
  return shown.length > 0 ? shown : years.filter((year) => defaultYears.includes(year));
}

export function isSameYears(a: readonly number[], b: readonly number[]) {
  return a.length === b.length && a.every((year) => b.includes(year));
}
