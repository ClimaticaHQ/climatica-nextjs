import type { EWalterLiethSeriesId } from "@/enums";
import type { ReactNode } from "react";
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

export type TShownChartModeArgs = {
  chartMode: TChartMode;
  dataset: TDataset;
};

export type TWalterLiethShownArgs = {
  pathname: string;
  searchParams: URLSearchParams;
  dataset: TDataset;
};

export type TCompareMode = "cities" | "periods";

/** Missing values are null — the chart draws a gap there, never a 0. */
export type TComparePoint = {
  month: number;
  monthName: string;
  tmaxA: number | null;
  tminA: number | null;
  tavgA: number | null;
  precA: number | null;
  tmaxB: number | null;
  tminB: number | null;
  tavgB: number | null;
  precB: number | null;
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
};

/** Which axis a unit title (°C / mm) belongs to. */
export type TUnitTitleSide = "left" | "right";

export type TUnitTitlePlacementArgs = {
  side: TUnitTitleSide;
  chartWidth: number;
  /** one panel of a split pair — the compact margins */
  isCompact: boolean;
};
