import { PANEL_SUBTITLE_SEPARATOR } from "@/constants";
import { ECompareLayout, EDisplayMetric, EWalterLiethSeriesId } from "@/enums";
import type {
  TExpandablePanels,
  TExpandedPanel,
  TExportedPanelArgs,
  TExportedSeriesLabelsArgs,
  TWalterLiethSeriesInput,
} from "@/types";
import { roundForDisplay } from "./displayFormat.util";
import { isCompleteSeries } from "./walterLieth.util";

export function getShownPanel(
  expanded: TExpandedPanel,
  expandable: TExpandablePanels,
): TExpandedPanel {
  return expanded !== null && expandable[expanded] ? expanded : null;
}

export function isSplitComparison({
  chartMode,
  layout,
  seriesA,
  seriesB,
}: Omit<TExportedPanelArgs, "expanded">) {
  const hasPair = isCompleteSeries(seriesA) && isCompleteSeries(seriesB);
  return layout === ECompareLayout.SPLIT || (chartMode === "walter-lieth" && !hasPair);
}

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

export function getExportedSeriesLabels({ expanded, labelA, labelB }: TExportedSeriesLabelsArgs) {
  if (expanded === null) return [labelA, labelB];
  return [expanded === EWalterLiethSeriesId.A ? labelA : labelB];
}

export function getPanelSubtitle({
  period,
  altitude,
}: Pick<TWalterLiethSeriesInput, "period" | "altitude">) {
  // * no locale reaches the export's panels: rounded like every elevation, printed plainly
  const shownAltitude =
    altitude !== undefined ? `${roundForDisplay(altitude, EDisplayMetric.ELEVATION)} m` : undefined;
  return joinSubtitle(period, shownAltitude);
}

export function joinSubtitle(...parts: readonly (string | undefined)[]) {
  return parts.filter(Boolean).join(PANEL_SUBTITLE_SEPARATOR);
}
