import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import type {
  TActiveMonth,
  TMonthlyValuesEntry,
  TMonthlyValuesRow,
  TMonthlyValuesSeries,
} from "@/types";

export type TValuesMarker = TSeriesMarkerProps & {
  title?: string;
};

export type TMonthlyValuesTableProps = TActiveMonth & {
  series: readonly TMonthlyValuesSeries[];
  isCompact: boolean;
  markers?: readonly TValuesMarker[] | undefined;
};

export type TMonthlyValuesVariantProps = TActiveMonth & {
  rows: readonly TMonthlyValuesRow[];
  caption: string;
  markers: readonly TValuesMarker[];
  flashKeys: readonly string[];
};

export type THorizontalValuesProps = TMonthlyValuesVariantProps & {
  isCompact: boolean;
  isScrolling: boolean;
};

export type TValueStackProps = {
  entries: readonly TMonthlyValuesEntry[];
  markers?: readonly TValuesMarker[] | undefined;
  className: string;
};

export type TUnitLabelProps = {
  row: TMonthlyValuesRow;
  markers: readonly TValuesMarker[];
  keys: readonly string[];
};

export type THeaderMarkerProps = {
  marker: TValuesMarker;
  entityKey: string;
};
