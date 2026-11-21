import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import type {
  TActiveMonth,
  TMonthlyValuesEntry,
  TMonthlyValuesRow,
  TMonthlyValuesSeries,
} from "@/types";

/**
 * An overlay series in the table: its marker (shape and hatch) — and, where its header names it
 * (the standard overlay), its full name.
 */
export type TValuesMarker = TSeriesMarkerProps & {
  title?: string;
};

export type TMonthlyValuesTableProps = TActiveMonth & {
  /** one series, or two (overlay: A above B in each cell) */
  series: readonly TMonthlyValuesSeries[];
  /** one panel of a split pair: the plot's compact margins */
  isCompact: boolean;
  /** an overlay: each series' marker, in series order, before its values */
  markers?: readonly TValuesMarker[] | undefined;
};

/** What both variants draw: the rows, the caption, the shared hovered month. */
export type TMonthlyValuesVariantProps = TActiveMonth & {
  rows: readonly TMonthlyValuesRow[];
  caption: string;
  /** each series' marker, in series order; none for one series */
  markers: readonly TValuesMarker[];
  /** its series' keys — the frame flashes when their data updates */
  flashKeys: readonly string[];
};

export type THorizontalValuesProps = TMonthlyValuesVariantProps & {
  isCompact: boolean;
  /** under a scrolling overlay: shown at every width, the plot's scroll */
  isScrolling: boolean;
};

export type TValueStackProps = {
  entries: readonly TMonthlyValuesEntry[];
  /** each entry's series marker, drawn before its value; none: values only */
  markers?: readonly TValuesMarker[] | undefined;
  /** alignment of the stacked values (horizontal: centered; vertical: right) */
  className: string;
};

export type TUnitLabelProps = {
  row: TMonthlyValuesRow;
  /** an overlay: the series' markers stacked beside the unit, one per value line */
  markers: readonly TValuesMarker[];
  /** the series' keys, in the same order — the entity a named marker focuses */
  keys: readonly string[];
};

export type THeaderMarkerProps = {
  marker: TValuesMarker;
  /** its series' key — the entity it focuses */
  entityKey: string;
};
