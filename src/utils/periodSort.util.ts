import { ESortOrder } from "@/enums";

const DIRECTIONS = { [ESortOrder.ASC]: 1, [ESortOrder.DESC]: -1 } satisfies Record<
  ESortOrder,
  number
>;

const FLIPPED = {
  [ESortOrder.ASC]: ESortOrder.DESC,
  [ESortOrder.DESC]: ESortOrder.ASC,
} satisfies Record<ESortOrder, ESortOrder>;

/** Entities by year, in the page's order: oldest first (asc) or newest first (desc). */
export function sortByYear<T>(
  items: readonly T[],
  yearOf: (item: T) => number,
  order: ESortOrder,
): T[] {
  return [...items].sort((a, b) => (yearOf(a) - yearOf(b)) * DIRECTIONS[order]);
}

/** Years in the page's order. */
export const sortYears = (years: readonly number[], order: ESortOrder) =>
  sortByYear(years, (year) => year, order);

/** The other direction: the sort button's toggle. */
export const flipSortOrder = (order: ESortOrder) => FLIPPED[order];
