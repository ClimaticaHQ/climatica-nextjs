import type {
  ECompareLayout,
  EWalterLiethRegime,
  EWalterLiethSeriesId,
  EWalterLiethShading,
} from "@/enums";
import type { TChartSummary } from "../components/chart";

export type TMonthAridity = {
  month: number;
  /** null when the month lacks a temperature or precipitation value */
  isArid: boolean | null;
  prec: number | null;
  tavg: number | null;
  tmax: number | null;
  tmin: number | null;
};

export type TWalterLiethScales = {
  tempMin: number;
  tempMax: number;
  precMin: number;
  precMax: number;
  plotMax: number;
};

/**
 * Shared drawing domain for WL diagrams, in °C / scaled units (precipitation is plotted
 * through the temperature scale). Every diagram of a comparison gets the same domain.
 * precMin is left out — it's always tempMin × LINEAR_RATIO, so storing it is derived data.
 */
export type TWalterLiethDomain = Omit<TWalterLiethScales, "precMin">;
// * Units: every TWalterLiethDomain field is in the shared axis unit (°C). precMax is the
// * precipitation maximum AFTER toPrecipAxisValue — never raw mm — so tempMax, precMax and
// * plotMax are directly comparable.

export type TWalterLiethMonth = {
  /** mean monthly temperature, °C */
  tavg: number;
  /** monthly precipitation, mm */
  prec: number;
};

export type TWalterLiethSeries = {
  /** color identity in comparisons (A green, B orange) */
  id: EWalterLiethSeriesId;
  /** location name (cities) or period label (periods) */
  label: string;
  /** e.g. "1970–2000" */
  period: string;
  /** metres above sea level */
  altitude?: number;
  /** 12 entries, January first */
  months: readonly TWalterLiethMonth[];
};

/** A point in chart space: x = month position (0 = January), y = °C / scaled units. */
export type TWalterLiethPoint = {
  x: number;
  y: number;
};

/** One humid or arid region between the curves, split at the exact crossings. */
export type TWalterLiethSegment = {
  regime: EWalterLiethRegime;
  /** closed polygon: precipitation curve forward, temperature curve back */
  points: readonly TWalterLiethPoint[];
};

export type TGetAridHumidSegmentsArgs = {
  months: readonly TWalterLiethMonth[];
  /** left-to-right month indices (0 = January); defaults to Jan–Dec */
  monthOrder?: readonly number[];
};

/** Raw data extents a domain is rounded outward from. */
export type TWalterLiethDomainExtents = {
  /** °C */
  tempMin: number;
  /** °C */
  tempMax: number;
  /** raw mm — converted to axis units by buildDomain */
  precMaxMm: number;
};

/** A band between two curves at one x: lower and upper edge, in axis units. */
export type TWalterLiethBandBounds = {
  lower: number;
  upper: number;
};

export type TWalterLiethChartProps = {
  series: TWalterLiethSeries;
  domain: TWalterLiethDomain;
  /** smaller height and header, for one diagram of a split pair */
  isCompact?: boolean;
  /** false hides the location/period title, e.g. where the surrounding card already shows it */
  showTitle?: boolean;
  /** false hides the legend, e.g. when a split pair shows one shared legend below both */
  showLegend?: boolean;
  /** one panel of a split pair: its own light card, a series-colored dot before the name */
  isPanel?: boolean;
  /** series to compare against — its difference is shown under this series' stats (split B) */
  reference?: TWalterLiethSeries | undefined;
  /**
   * Recharts syncId — diagrams sharing it hover in sync. Recharts syncs by data index, so
   * every diagram sharing one must use the same month order (and 12 rows each).
   */
  syncId?: string;
  /** left-to-right month indices (0 = January); defaults to Jan–Dec */
  monthOrder?: readonly number[];
  /** position (0-based, in monthOrder) of the month highlighted from outside, e.g. a table row */
  activeMonthIndex?: number | null;
  onActiveMonthIndexChange?: (index: number | null) => void;
};

/** One chart row per month, in display order. */
export type TWalterLiethRow = {
  /** x position on the chart: 0 = first month of monthOrder */
  position: number;
  /** calendar month, 0 = January */
  monthIndex: number;
  tavg: number;
  prec: number;
  /** prec after toPrecipAxisValue */
  precAxis: number;
};

export type TWalterLiethFillArgs = {
  regime: EWalterLiethRegime;
  humidPatternUrl: string;
  aridPatternUrl: string;
  perhumidColor: string;
};

export type TToSvgPathArgs = {
  points: readonly TWalterLiethPoint[];
  scaleX: (x: number) => number;
  scaleY: (y: number) => number;
  /** true (default) closes a polygon; false leaves a curve open */
  isClosed?: boolean;
};

export type TFormatMonthLabelArgs = {
  locale: string;
  /** calendar month, 0 = January */
  monthIndex: number;
  format: "short" | "narrow" | "long";
};

export type TToWalterLiethSeriesArgs = Omit<TWalterLiethSeries, "months"> & {
  data: readonly { tavg: number | null; prec: number | null }[];
};

/**
 * A series whose data lacks a month's temperature or precipitation: never drawn as WL (the
 * standard split still plots it, with gaps, under its name and period).
 */
export type TWalterLiethIncompleteSeries = Pick<TWalterLiethSeries, "id" | "label" | "altitude"> & {
  period?: string;
  months: null;
};

/** What a page hands to the WL components — complete, or known to be incomplete. */
export type TWalterLiethSeriesInput = TWalterLiethSeries | TWalterLiethIncompleteSeries;

export type TWalterLiethComparisonProps = {
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
  /** persisted by the page (URL state); switched from the chart header */
  layout: ECompareLayout;
  /** which series the overlay hatches — persisted by the page (URL state) */
  shading: EWalterLiethShading;
};

/** How one series is painted: WL convention colors, or one series color in overlay. */
export type TWalterLiethLayerPaint = {
  temp: string;
  prec: string;
  humidHatch: string;
  aridHatch: string;
  perhumid: string;
  perhumidOpacity: number;
};

/** Series B minus series A, per statistic — null when either side is unknown. */
export type TSummaryDeltas = {
  meanTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};

export type TFormatSummaryDeltasArgs = {
  reference: TChartSummary;
  summary: TChartSummary;
  /** the translated, pluralized arid-months difference — the sign is its own argument */
  formatAridMonths: (sign: string, count: number) => string;
};

/** Pattern geometry for one plot, in px — see getHatchGeometry. */
export type TWalterLiethHatchGeometry = {
  /** horizontal distance between humid lines — also the arid dot columns */
  spacing: number;
  dotRadius: number;
  /** vertical distance between arid dot rows */
  dotRowHeight: number;
};
