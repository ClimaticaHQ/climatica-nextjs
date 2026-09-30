import { PANEL_SUBTITLE_SEPARATOR } from "@/constants";
import { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type {
  TExpandablePanels,
  TExpandedPanel,
  TExportedPanelArgs,
  TExportedSeriesLabelsArgs,
  TWalterLiethSeriesInput,
} from "@/types";
import { isCompleteSeries } from "./walterLieth.util";

/** The expanded panel as shown: none when it has nothing to expand (an incomplete series). */
export function getShownPanel(
  expanded: TExpandedPanel,
  expandable: TExpandablePanels,
): TExpandedPanel {
  return expanded !== null && expandable[expanded] ? expanded : null;
}

/** Whether a comparison shows split panels: split layout, or WL overlay without two complete series. */
export function isSplitComparison({
  chartMode,
  layout,
  seriesA,
  seriesB,
}: Omit<TExportedPanelArgs, "expanded">) {
  const hasPair = isCompleteSeries(seriesA) && isCompleteSeries(seriesB);
  return layout === ECompareLayout.SPLIT || (chartMode === "walter-lieth" && !hasPair);
}

/**
 * The panel an export shows alone — as on screen: only in the split (WL overlay falls back to
 * it without two complete series), and only a panel with a header (WL: a complete series).
 */
export function getExportedPanel({
  chartMode,
  layout,
  expanded,
  seriesA,
  seriesB,
}: TExportedPanelArgs): TExpandedPanel {
  const isWalterLieth = chartMode === "walter-lieth";
  if (!isSplitComparison({ chartMode, layout, seriesA, seriesB })) return null;
  return getShownPanel(expanded, {
    [EWalterLiethSeriesId.A]: !isWalterLieth || isCompleteSeries(seriesA),
    [EWalterLiethSeriesId.B]: !isWalterLieth || isCompleteSeries(seriesB),
  });
}

/** The series an export file name lists: the expanded one, or both. */
export function getExportedSeriesLabels({ expanded, labelA, labelB }: TExportedSeriesLabelsArgs) {
  if (expanded === null) return [labelA, labelB];
  return [expanded === EWalterLiethSeriesId.A ? labelA : labelB];
}

/** A split panel's subtitle: "Climate 1970–2000 · 261 m" — period, then altitude when known. */
export function getPanelSubtitle({
  period,
  altitude,
}: Pick<TWalterLiethSeriesInput, "period" | "altitude">) {
  return joinSubtitle(period, altitude !== undefined ? `${Math.round(altitude)} m` : undefined);
}

/** A panel's period line from its parts, the empty ones left out. */
export function joinSubtitle(...parts: readonly (string | undefined)[]) {
  return parts.filter(Boolean).join(PANEL_SUBTITLE_SEPARATOR);
}
