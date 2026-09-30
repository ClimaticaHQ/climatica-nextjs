import type { EWalterLiethSeriesId } from "@/enums";
import type { TMonthlyTemperature } from "../domain";
import type { TMartonneBadge } from "../utils/martonne.type";

/** The comparison table's rows, in their display order. */
export type TComparisonMetric =
  | "meanTemp"
  | "avgTmax"
  | "avgTmin"
  | "annualPrec"
  | "aridMonths"
  | "frostMonths"
  | "altitude"
  | "martonne";

/** How a row's numbers read: unit (none for counts and Martonne) and decimals. */
export type TComparisonMetricFormat = {
  metric: TComparisonMetric;
  unit: string;
  digits: number;
};

/** One compared series: its identity (marker, color), name, monthly data and altitude. */
export type TComparisonTableSeries = {
  id: EWalterLiethSeriesId;
  label: string;
  data: readonly TMonthlyTemperature[];
  altitude: number | null;
};

/** A series' formatted value in a row; the Martonne row adds its class badge. */
export type TComparisonTableValue = {
  text: string;
  badge?: TMartonneBadge | undefined;
};

export type TComparisonTableRow = {
  metric: TComparisonMetric;
  a: TComparisonTableValue;
  b: TComparisonTableValue;
  /** minuend − subtrahend, signed with a real minus; null when either side is missing */
  difference: string | null;
};

/** The table as both the page and the export draw it. */
export type TComparisonTable = {
  seriesA: Pick<TComparisonTableSeries, "id" | "label">;
  seriesB: Pick<TComparisonTableSeries, "id" | "label">;
  /** the difference's direction: minuend − subtrahend, e.g. "Lviv − Valladolid" */
  minuend: string;
  subtrahend: string;
  rows: TComparisonTableRow[];
};

export type TBuildComparisonTableArgs = {
  seriesA: TComparisonTableSeries;
  seriesB: TComparisonTableSeries;
  /** which series the difference starts from: B − A for cities, the later period for periods */
  minuend: EWalterLiethSeriesId;
  /** the UI's locale — the values' decimal separator */
  locale: string;
};

/** The table's translated texts, as the export carries them (the page uses its hooks). */
export type TComparisonTableLabels = {
  metrics: Record<TComparisonMetric, string>;
  difference: string;
  /** each series' translated Martonne class (its badge); null when unknown */
  martonneClasses: { a: string | null; b: string | null };
};
