import type { EChartBody } from "@/enums";
import type { BAR_STYLES } from "@/constants";
import type { TChartMode, TSeriesKey } from "../components/chart";
import type { TSeriesHatch } from "./seriesShape.type";

export type TOverlayScrollArgs = {
  /** the plot container's width, axes included (px) */
  availableWidth: number;
  entityCount: number;
  /** between two bars of one month (px); absent: OVERLAY_BARS.GAP */
  gap?: number;
  /** the gap's floor (getOverlayGap): the plot fits while bars fit at it; absent: the gap */
  minGap?: number;
  /** a phone: the narrow axes' widths */
  isNarrow?: boolean;
  /** a fixed month band (a phone's overlay, getPhoneOverlayBars); absent: getMinOverlayBand */
  minBand?: number;
};

/** How the overlay lays out: its content width and whether it scrolls sideways. */
export type TOverlayScroll = {
  /** wider than its container — even the minimum bars don't fit: the plot scrolls, the hint shows */
  isOverflowing: boolean;
  /** the chart's width, axes included (px) */
  contentWidth: number;
  /** the plot's width between its axes (px) */
  plotWidth: number;
};

/** What the reader points at in an overlay: a curve, or an entity's bars. */
export type TOverlayFocus =
  | { id: string; target: "line"; variable: Exclude<TSeriesKey, "prec"> }
  | { id: string; target: "bar" }
  // * its marker in the values table's header: the entity alone, no month
  | { id: string; target: "entity" };

/**
 * An overflowing overlay's shared sideways scroll: its content width, and how a scroller (the
 * plot, the values table under it) joins it — every joined scroller keeps the same position.
 */
export type TChartScroll = {
  contentWidth: number;
  register: (element: HTMLElement | null) => void;
};

/** The overlay's focus, for the blocks under it (the values table): read and set. */
export type TChartFocus = {
  /** the focused entity; null: none */
  focusedId: string | null;
  /** a values-table header marker hovered or focused: its entity; null: left */
  onEntityFocus: (id: string | null) => void;
};

/** An entity's part while the overlay has a focus: the focused one, its context, or plain. */
export type TEntityRole = "focus" | "context" | "plain";

export type TOverlayBarLayoutArgs = {
  /** the plot's width between the axes (px) */
  plotWidth: number;
  /** the entities whose bars share each month (hidden ones take no place) */
  entityCount: number;
  /** between two bars of one month (px), while the bars can afford it; absent: OVERLAY_BARS.GAP */
  gap?: number;
  /** the gap's floor, near the minimum bar width (getOverlayGap); absent: the gap, fixed */
  minGap?: number;
};

/** A month's bars and their gap, for getOverlayGap. */
export type TOverlayGapArgs = {
  bandWidth: number;
  count: number;
  gap: number;
  minGap: number;
};

/** One month's bars: their width and each one's centre, from the month's centre (px). */
export type TOverlayBarLayout = {
  bandWidth: number;
  barSize: number;
  /** between two bars of the month (px): the style's, or less near the minimum bar width */
  gap: number;
  offsets: number[];
};

/** How a comparison overlay's bars tell entities apart: the chartBarStyle setting. */
export type TBarStyle = (typeof BAR_STYLES)[number];

export type TOverlayBarStyle = {
  /** between two bars of one month (px), while the bars can afford it */
  gap: number;
  /** the gap's floor as the bars near their minimum width — the fit is decided at it */
  minGap: number;
  /** the entity's hatch knocked out of its bars */
  hasHatch: boolean;
  /** each entity its own step of the humid and arid fills (PRECIP_BAR_SHADES) */
  hasShades: boolean;
};

/** An entity's bars as a swatch beside its shape (chips, legend): its hatch, or a fill; none: plain. */
export type TEntityBarSwatch = {
  hatch?: TSeriesHatch;
  fill?: string;
};

/** A phone overlay's bars: their fixed width and gap, and the month band they need (px). */
export type TPhoneOverlayBars = {
  barSize: number;
  gap: number;
  band: number;
};

export type TFixedOverlayBarLayoutArgs = {
  plotWidth: number;
  entityCount: number;
  barSize: number;
  gap: number;
};

/** What decides whether a view's entities show their bars' swatch (getSwatchBarStyle). */
export type TSwatchBarStyleArgs = {
  mode: TChartMode;
  body: EChartBody;
  /** the chartBarStyle setting */
  barStyle: TBarStyle;
  isPrecVisible: boolean;
};
