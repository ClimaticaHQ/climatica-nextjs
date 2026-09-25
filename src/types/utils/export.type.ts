import { WEATHER_VARIABLES } from "@/constants";
import type {
  TBbox,
  TCellBounds,
  TCellSize,
  TChartMode,
  TClimatePeriod,
  TCompareStats,
  TDataset,
  TDatasetAttribution,
  TLocale,
  TMonthAridity,
  TMonthlyTemperature,
  TMonthlyTemperatureWithAvg,
  TVariable,
  TWalterLiethScales,
} from "@/types";

export type TCsvVariable = (typeof WEATHER_VARIABLES)[number];

/** One month's readings across every SCRAPI variable, not just tmax/tmin/prec. */
export type TFullVariableMonthRow = {
  month: number;
  monthName: string;
} & Partial<Record<TVariable, number>>;

/** Lazily fetched — populated only when the user triggers the raw CSV/JSON export. */
export type TExportRawData = {
  rows: TFullVariableMonthRow[];
  variables: readonly TVariable[];
};

export type TExportLocation = {
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
};

/** Structurally matches TChartSubtitle (TempPrecipChart.type.ts) without depending on it. */
export type TExportSubtitle = {
  dataset?: TDataset;
  climatePeriod?: TClimatePeriod;
  weatherYear?: number;
  rawLabel?: string;
};

/** Structurally matches TChartSummary (TempPrecipChart.type.ts) without depending on it. */
export type TExportSummary = {
  annualAvgTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};

export type TExportMonthlyRow = TMonthlyTemperature & { tavg: number };

/** Structurally matches TVisibleSeries (TempPrecipChart.type.ts) without depending on it. */
export type TExportVisibleSeries = {
  tmax: boolean;
  tmin: boolean;
  tavg: boolean;
  prec: boolean;
};

/**
 * Every translated string buildExportSvg() needs, resolved by the caller (which has
 * useTranslations()) so the builder itself stays a pure, i18n-agnostic function.
 * All values reuse EXISTING translation keys — no new i18n keys were added for this.
 */
export type TExportLabels = {
  /** e.g. "Climate 1970–2000" / "Weather 2024" — chart.subtitle.climate / .weather */
  periodLabel: string;
  /** 12 short month labels in order — months.1..months.12 */
  monthNames: string[];
  seriesLabels: {
    tmax: string;
    tmin: string;
    tavg: string;
    prec: string;
  };
  statsLabels: {
    meanTemp: string;
    annualPrec: string;
    aridMonths: string;
    altitude: string;
    martonne: string;
  };
  /** chart.avgTempShort / chart.precipShort — short row labels for buildDataTable(),
   *  matching ClimateDataTable.tsx's on-screen labels exactly. */
  tableLabels: {
    avgTemp: string;
    precip: string;
  };
  /** chart.monthAxis ("Month") — °C/mm axis units are unit symbols, not translated
   *  even in the live chart (StandardClimateChart.tsx hardcodes them literally). */
  monthAxisLabel: string;
  /** martonne.arid / .semiArid / etc. — omitted when summary.martonne is null */
  martonneClassLabel?: string;
  /** chart.aridPeriod / chart.humidPeriod — matches AridityLegend.tsx exactly */
  aridityLegend: {
    arid: string;
    humid: string;
  };
};

export type TExportChartColors = {
  text: string;
  textSecondary: string;
  border: string;
  bg: string;
  tmax: string;
  tmin: string;
  tavg: string;
  arid: string;
  humid: string;
  /** Resolved --color-primary — only the heat-map export's selection outline
   * uses this (RASTER_SELECTION_PATH_OPTIONS' stroke/fill on the live map),
   * but it's resolved here alongside the rest so every builder shares one
   * color-resolution pass. */
  primary: string;
};

export type TExportPayload = {
  location: TExportLocation;
  gridSize: TCellSize;
  subtitle: TExportSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TExportVisibleSeries;
  monthlyData: TExportMonthlyRow[];
  summary: TExportSummary;
  aridity: TMonthAridity[];
  scales: TWalterLiethScales;
  rightMax: number;
  chartMode: TChartMode;
  labels: TExportLabels;
  /** Canonical, shareable link to the current view — see buildShareableUrl(). */
  shareUrl: string;
  /** Live WorldClim + CRU-TS attribution, always both regardless of dataset —
   * null while useGetDatasetVersion() is still loading. */
  datasetAttribution: TDatasetAttribution | null;
  rawData?: TExportRawData;
};

export type TBuildExportPayloadParams = {
  locale: TLocale;
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
  gridSize: TCellSize;
  subtitle: TExportSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TExportVisibleSeries | null;
  chartDataSingle: TExportMonthlyRow[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  summary: TExportSummary | null;
  rightMax: number;
  chartMode: TChartMode;
  labels: TExportLabels;
  datasetAttribution: TDatasetAttribution | null;
};

/** Everything buildShareableUrl() needs to reconstruct the current view's URL
 * from state directly, instead of reading window.location (which can briefly lag
 * behind the latest city/filter change via the app's async URL-sync effect). */
export type TBuildShareableUrlParams = {
  locale: TLocale;
  cityName: string;
  lat: number;
  lng: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  subtitle: TExportSubtitle;
};

/** Mirrors ComparePeriods.tsx's own URL-sync effect param set. */
export type TBuildComparePeriodsShareUrlParams = {
  locale: TLocale;
  cityName: string;
  lat: number;
  lng: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  dataset: TDataset;
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  weatherPeriods: number[];
};

/** Mirrors CompareCities.tsx's own URL-sync effect param set. */
export type TBuildCompareCitiesShareUrlParams = {
  locale: TLocale;
  cityAName: string;
  latA: number;
  lngA: number;
  cityBName: string;
  latB: number;
  lngB: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  subtitle: TExportSubtitle;
};

/** Mirrors HeatMap.tsx's own URL-sync effect param set. */
export type TBuildHeatMapShareUrlParams = {
  locale: TLocale;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  subtitle: TExportSubtitle;
  bbox: TBbox | null;
  polygonWkt: string | null;
};

export type TCompareExportSeriesColors = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
};

/** One column of a comparison export — a city (compare-cities), a climate period
 * (compare-periods climate mode), or a weather year (compare-periods multi-period
 * mode). buildCompareExportSvg() renders 2..N of these uniformly. */
export type TCompareExportSeries = {
  label: string;
  data: TMonthlyTemperatureWithAvg[];
  stats: TCompareStats;
  altitude: number | null;
  martonneClassLabel: string | null;
  colors: TCompareExportSeriesColors;
};

/** One row of buildCompareExportSvg()'s stats table — a metric label plus how
 * to format it off a given series (avg max temp, total precip, etc). */
export type TCompareExportStatsRow = {
  label: string;
  format: (series: TCompareExportSeries) => string;
};

export type TCompareExportLabels = {
  monthNames: string[];
  monthAxisLabel: string;
  seriesLabels: {
    tmax: string;
    tmin: string;
    tavg: string;
    prec: string;
  };
  statsLabels: {
    avgTmax: string;
    avgTmin: string;
    totalPrec: string;
    aridMonths: string;
    altitude: string;
    martonne: string;
  };
};

/** Shared by compare-cities, compare-periods climate mode (2 series) and
 * compare-periods weather/multi-period mode (up to 5 series) — one builder,
 * buildCompareExportSvg(), covers all three. */
export type TCompareExportPayload = {
  headerTitle: string;
  headerSubtitle: string;
  series: TCompareExportSeries[];
  visibleSeries: TExportVisibleSeries;
  selectedMonths: number[] | null;
  scales: TWalterLiethScales;
  rightMax: number;
  labels: TCompareExportLabels;
  /** Multi-period mode only ever draws tmax/tmin (MultiPeriodChart has no tavg
   * line) — compare-cities/compare-periods climate mode draw all three. */
  showTavgLine: boolean;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
};

/** The subset of an export's own layout constants buildFooterTextLines() needs
 * to size and wrap the footer — every *_EXPORT_SVG_LAYOUT object has these
 * fields (via EXPORT_SVG_SHARED_LAYOUT), whatever canvas width it uses. */
export type TFooterTextLayout = {
  width: number;
  paddingX: number;
  footerFontSize: number;
  footerUrlMinFontSize: number;
  footerUrlAvgCharWidthRatio: number;
};

/** One rendered footer line — buildFooterTextLines() picks the font size per
 * line, since the share-URL line may shrink (or wrap into several lines at the
 * minimum size) while the other two never do. */
export type TFooterTextLine = {
  text: string;
  fontSize: number;
};

/** Params for buildFooterTextLines() — the footer shared by every export
 * builder (single-city, compare, heat-map). Always at least 2 lines (brand,
 * attribution) plus 1+ share-URL lines. */
export type TFooterLinesParams = {
  /** e.g. "Climate 1970–2000", "Lviv vs Madrid", "2018 vs 2020" — whatever names
   * this specific export's view. */
  contextLabel: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  layout: TFooterTextLayout;
};

export type THeatmapExportStat = {
  label: string;
  value: string;
  subtitle?: string;
};

/** One heatmap pixel, ready to draw — color already resolved (interpolateColor()
 * is pure, so this is safe to compute at payload-build time, unlike the CSS-var
 * colors in TExportChartColors). */
export type THeatmapExportCell = {
  bounds: TCellBounds;
  color: string;
};

/** The user's drawn region — a bbox or a polygon, whichever is active. Mirrors
 * HeatMap.type.ts's TBbox/TPolygon without depending on that page's types. */
export type THeatmapExportSelection =
  { kind: "bbox"; bounds: TCellBounds } | { kind: "polygon"; vertices: [number, number][] };

/** Pure geo data for the export's map section — buildHeatmapMapSection() does
 * all the projection/tile-fetching; this only carries what to draw. */
export type THeatmapExportMapSection = {
  /** Bounding box of the selection (the bbox itself, or the polygon's bounds) —
   * what buildFitZoom()/computeMapOrigin() fit the view to. */
  selectionBounds: TCellBounds;
  cells: THeatmapExportCell[];
  selection: THeatmapExportSelection;
};

export type THeatmapExportPayload = {
  headerTitle: string;
  headerSubtitle: string;
  stats: THeatmapExportStat[];
  gradientColors: string[];
  minLabel: string;
  maxLabel: string;
  mapSection: THeatmapExportMapSection;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
};

export type TLinearScale = (value: number) => number;

export type TMonthBand = {
  x: number;
  width: number;
  center: number;
};

export type TSvgToPngParams = {
  svg: string;
  width: number;
  height: number;
  scale?: number;
  filename: string;
};

/** Every buildXExportSvg() returns this instead of a bare string — the canvas
 * height is derived from how many lines the footer actually wrapped to (see
 * buildFooterTextLines()), so callers must read it back rather than assuming
 * a fixed *_EXPORT_SVG_LAYOUT.height. */
export type TSvgExportResult = {
  svg: string;
  height: number;
};

/** Narrows TExportPayload.rawData from optional to required — the type-level
 * guarantee that exportRawCsv/exportRawJson were called only after the lazy
 * fetch populated it, instead of a redundant runtime null-check inside them. */
export type TExportPayloadWithRawData = TExportPayload & { rawData: TExportRawData };

export type TRawJsonExport = {
  city: string;
  coordinates: { lat: number; lng: number };
  altitude: number | null;
  gridSize: TCellSize;
  dataset: TDataset | null;
  climatePeriod: TClimatePeriod | null;
  weatherYear: number | null;
  variables: readonly TVariable[];
  monthly: TFullVariableMonthRow[];
};
