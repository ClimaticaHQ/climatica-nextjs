import type { TPanelExpansion, TVisibleSeries } from "@/types";

/** The chart's pre-toggle-interaction default — also the export payload's fallback. */
export const DEFAULT_VISIBLE_SERIES: TVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

export const CHART_COLORS = {
  arid: "var(--chart-arid)",
  humid: "var(--chart-humid)",
  single: {
    tmax: "var(--chart-temp-max)",
    tmin: "var(--chart-temp-min)",
    tavg: "var(--chart-temp-avg)",
  },
  compareA: {
    tmax: "var(--chart-compare-a-max)",
    tmin: "var(--chart-compare-a-min)",
    prec: "var(--chart-compare-a-prec)",
    tavg: "var(--chart-compare-a-tavg)",
  },
  compareB: {
    tmax: "var(--chart-compare-b-max)",
    tmin: "var(--chart-compare-b-min)",
    prec: "var(--chart-compare-b-prec)",
    tavg: "var(--chart-compare-b-tavg)",
  },
};

// * the chart card's layout — relative: the data update's progress bar runs along its top edge
export const CHART_CARD_LAYOUT_CLASS = "relative w-full";

// * a chart without a page-held expanded panel (single city): both panels, always
export const NO_PANEL_EXPANSION: TPanelExpansion = {
  expanded: null,
  onExpandedChange: () => undefined,
};

// * bars recolored by aridity — the legend's arid / humid entries
export const ARIDITY_BAR_COLORS = {
  arid: CHART_COLORS.arid,
  humid: CHART_COLORS.humid,
} as const;
