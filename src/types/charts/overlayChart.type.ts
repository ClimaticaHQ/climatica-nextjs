import type { TSeriesKey } from "../components/chart";

export type TOverlayScrollArgs = {
  /** the plot container's width, axes included (px) */
  availableWidth: number;
  entityCount: number;
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
};

/** One month's bars: their width and each one's centre, from the month's centre (px). */
export type TOverlayBarLayout = {
  bandWidth: number;
  barSize: number;
  offsets: number[];
};
