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

export type TActiveMonth = {
  activeMonthIndex: number | null;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
};

export type TExpandedPanel = EWalterLiethSeriesId | null;

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

export type TMonthLabelFormat = "short" | "narrow";

export type TPlotHeightArgs = {
  isCompact: boolean;
};

export type TPanelHeaderSlots = {
  actions?: ReactNode;
  name?: ReactNode;
};

export type TUnitTitleSide = "left" | "right";

export type TAxisSizeArgs = {
  isCompact: boolean;
  isNarrow?: boolean | undefined;
  textScale?: number | undefined;
};

export type TUnitTitlePlacementArgs = TAxisSizeArgs & {
  side: TUnitTitleSide;
  chartWidth: number;
};

export type TChartMarginArgs = {
  bands?: TAnnotationBands | undefined;
  textScale?: number | undefined;
};

export type TMonthLabelFormatArgs = {
  chartWidth: number | null;
  isNarrow?: boolean | undefined;
  textScale?: number | undefined;
};
