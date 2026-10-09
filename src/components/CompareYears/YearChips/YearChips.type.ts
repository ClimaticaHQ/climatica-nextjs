import type { TYearOption } from "@/types";

export type TYearChipsProps = {
  years: readonly TYearOption[];
  /** the years drawn — at least one */
  shown: readonly number[];
  onShownChange: (years: number[]) => void;
  /** a chip hovered or focused (null: none) — the diagram fades the other years */
  onHighlight: (year: number | null) => void;
};
