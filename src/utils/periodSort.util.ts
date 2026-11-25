import { ESortOrder } from "@/enums";

const DIRECTIONS = { [ESortOrder.ASC]: 1, [ESortOrder.DESC]: -1 } satisfies Record<
  ESortOrder,
  number
>;

const FLIPPED = {
  [ESortOrder.ASC]: ESortOrder.DESC,
  [ESortOrder.DESC]: ESortOrder.ASC,
} satisfies Record<ESortOrder, ESortOrder>;

export function sortByYear<T>(
  items: readonly T[],
  yearOf: (item: T) => number,
  order: ESortOrder,
): T[] {
  return [...items].sort((a, b) => (yearOf(a) - yearOf(b)) * DIRECTIONS[order]);
}

export const sortYears = (years: readonly number[], order: ESortOrder) =>
  sortByYear(years, (year) => year, order);

export const flipSortOrder = (order: ESortOrder) => FLIPPED[order];
