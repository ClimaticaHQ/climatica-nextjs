import type { TComparisonTable, TComparisonTableRow, TComparisonTableValue } from "@/types";

export type TComparisonTableProps = {
  table: TComparisonTable;
};

export type TSeriesHeaderProps = {
  series: TComparisonTable["seriesA"];
};

export type TComparisonValueCellProps = {
  value: TComparisonTableValue;
  /** the series' text color */
  color: string;
  /** below `sm`, B's cell also shows the difference (its column is hidden there) */
  difference?: string | null | undefined;
};

export type TComparisonTableRowProps = {
  row: TComparisonTableRow;
  table: TComparisonTable;
};
