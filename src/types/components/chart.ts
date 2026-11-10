import type { EWalterLiethSeriesId } from "@/enums";
import type { ReactNode } from "react";
import type { TAnnotationBands } from "../charts/chartOverlay.type";
import { TClimatePeriod } from "../api";
import { TDataset, TMonthlyTemperature } from "../domain";

export type TMultiPeriodEntry = { year: number; rows: TMonthlyTemperature[] };

export type TSeriesKey = "tmax" | "tmin" | "tavg" | "prec";

export type TVisibleSeries = Record<TSeriesKey, boolean>;

export type TChartSubtitle = {
  dataset?: TDataset;
  climatePeriod?: TClimatePeriod;
  weatherYear?: number;
  rawLabel?: string;
};

export type TChartMode = "standard" | "walter-lieth";

/** The month hovered or focused in any chart or strip of a card — highlighted in all of them. */
export type TActiveMonth = {
  activeMonthIndex: number | null;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
};

/** Which split panel fills the chart card; null = both side by side (the default). */
export type TExpandedPanel = EWalterLiethSeriesId | null;

/** The split's expanded panel — persisted by the page (URL state), switched from the panels. */
export type TPanelExpansion = {
  expanded: TExpandedPanel;
  onExpandedChange: (expanded: TExpandedPanel) => void;
};

export type TWalterLiethShownArgs = {
  pathname: string;
  searchParams: URLSearchParams;
};

export type TChartSummary = {
  annualAvgTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};

/** Intl month format for chart axis labels: "short" (Jan) or "narrow" (J). */
export type TMonthLabelFormat = "short" | "narrow";

export type TPlotHeightArgs = {
  /** one panel of a split pair — the compact heights */
  isCompact: boolean;
};

/** What a split panel adds to its header: expand / collapse controls, and B's "vs A" note. */
export type TPanelHeaderSlots = {
  /** top-right of the header, beside the name */
  actions?: ReactNode;
  /** in place of the name — e.g. a picker choosing which year the panel shows */
  name?: ReactNode;
};

/** Which axis a unit title (°C / mm) belongs to. */
export type TUnitTitleSide = "left" | "right";

/** A chart's axis sizes: by the chart's room, then scaled with the text. */
export type TAxisSizeArgs = {
  /** one panel of a split pair — the compact margins */
  isCompact: boolean;
  /** a phone: the narrow axes */
  isNarrow?: boolean | undefined;
  /** the effective text scale (useTextScale); absent: 1, the exports' fixed sizes */
  textScale?: number | undefined;
};

export type TUnitTitlePlacementArgs = TAxisSizeArgs & {
  side: TUnitTitleSide;
  chartWidth: number;
};

export type TChartMarginArgs = {
  /** room kept for annotations above and below the plot */
  bands?: TAnnotationBands | undefined;
  textScale?: number | undefined;
};

export type TMonthLabelFormatArgs = {
  /** the chart's measured width; null before it's measured */
  chartWidth: number | null;
  isNarrow?: boolean | undefined;
  textScale?: number | undefined;
};
