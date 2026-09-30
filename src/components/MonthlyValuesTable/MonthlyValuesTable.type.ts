import type {
  TActiveMonth,
  TMonthlyValuesEntry,
  TMonthlyValuesRow,
  TMonthlyValuesSeries,
} from "@/types";

export type TMonthlyValuesTableProps = TActiveMonth & {
  /** one series, or two (overlay: A above B in each cell) */
  series: readonly TMonthlyValuesSeries[];
  /** one panel of a split pair: the plot's compact margins */
  isCompact: boolean;
};

/** What both variants draw: the rows, the caption, the shared hovered month. */
export type TMonthlyValuesVariantProps = TActiveMonth & {
  rows: readonly TMonthlyValuesRow[];
  caption: string;
  /** its series' keys — the frame flashes when their data updates */
  flashKeys: readonly string[];
};

export type THorizontalValuesProps = TMonthlyValuesVariantProps & {
  isCompact: boolean;
};

export type TValueStackProps = {
  entries: readonly TMonthlyValuesEntry[];
  /** alignment of the stacked values (horizontal: centered; vertical: right) */
  className: string;
};

export type TUnitLabelProps = {
  row: TMonthlyValuesRow;
};
