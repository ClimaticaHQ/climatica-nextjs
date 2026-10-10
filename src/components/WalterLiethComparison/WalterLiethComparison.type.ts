import type {
  TWalterLiethDotShape,
  TWalterLiethLayerSeries,
  TWalterLiethTooltipProps,
} from "@/components/WalterLiethChart/WalterLiethChart.type";
import type { EWalterLiethShading } from "@/enums";
import type { ReactNode } from "react";
import type {
  TActiveMonth,
  TPanelExpansion,
  TWalterLiethDomain,
  TWalterLiethRow,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
} from "@/types";

export type TSeriesPair = {
  seriesA: TWalterLiethSeries;
  seriesB: TWalterLiethSeries;
};

export type TShadingControlProps = TSeriesPair & {
  shading: EWalterLiethShading;
  onChange: (shading: EWalterLiethShading) => void;
};

export type TSplitViewProps = {
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
  domain: TWalterLiethDomain;
  syncId: string;
  expansion: TPanelExpansion;
  activeMonth: TActiveMonth;
};

/** One series in an overlay: Climate A / B, or a compared weather year. */
export type TOverlayEntry = {
  key: string;
  series: TWalterLiethSeries;
  color: string;
  shape: TWalterLiethDotShape;
  /** hatched (humid / arid) — at most one, so the curves stay readable */
  isShaded: boolean;
  /** another entry is highlighted: this one fades */
  isDimmed?: boolean;
};

export type TOverlayViewProps = {
  entries: readonly TOverlayEntry[];
  domain: TWalterLiethDomain;
  activeMonth: TActiveMonth;
  /** the legend names each series — off where chips above the diagram name them */
  shouldListSeries?: boolean;
  /** the chart card's blocks (values table, legend) in place of this chart's own — until every
   * page draws through the chart card */
  footer?: ReactNode;
};

export type TOverlayLayerArgs = Omit<
  TWalterLiethLayerSeries,
  "colors" | "precDash" | "dotShape"
> & {
  series: TWalterLiethSeries;
  isShaded: boolean;
  /** the series' own colour and dot; A / B's when omitted */
  color?: string;
  shape?: TWalterLiethDotShape;
};

/** What the overlay tooltip lists for each entry. */
export type TOverlayTooltipEntry = {
  key: string;
  label: string;
  color: string;
  rows: readonly TWalterLiethRow[];
};

export type TOverlayTooltipProps = TWalterLiethTooltipProps & {
  entries: readonly TOverlayTooltipEntry[];
};
