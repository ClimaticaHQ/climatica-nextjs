import { OverlayView } from "@/components/WalterLiethComparison/components";
import { OVERLAY_DIM_OPACITY } from "@/constants";
import { isCompleteSeries } from "@/utils";
import type { TOverlayChartProps } from "./charts.type";
import {
  buildStandardChartRows,
  getIdentityColor,
  getIdentityShape,
  getOverlayPalette,
  getShadedId,
} from "./charts.util";
import { StandardChart } from "./StandardChart";

/**
 * The overlay's chart: every drawn series in one Walter-Lieth diagram, or in the standard
 * chart (series turned off by their chips keep their place, hidden). A highlighted series dims
 * the others.
 */
export function OverlayChart({
  model,
  rule,
  viewState,
  visible,
  activeMonth,
  drawn,
  highlightedId,
  footer,
}: TOverlayChartProps) {
  const isDimmed = (id: string) => highlightedId !== null && highlightedId !== id;

  if (viewState.mode === "walter-lieth") {
    const shadedId = getShadedId(model, rule, viewState.shading?.value);
    return (
      <OverlayView
        entries={drawn.flatMap((entry) =>
          isCompleteSeries(entry.walterLieth)
            ? [
                {
                  key: entry.series.id,
                  series: entry.walterLieth,
                  color: getIdentityColor(entry, rule),
                  shape: getIdentityShape(entry, rule),
                  isShaded: entry.series.id === shadedId,
                  isDimmed: isDimmed(entry.series.id),
                },
              ]
            : [],
        )}
        domain={model.domain}
        activeMonth={activeMonth}
        footer={footer}
      />
    );
  }

  const drawnIds = new Set(drawn.map(({ series }) => series.id));
  const months = viewState.selectedMonths;
  return (
    <StandardChart
      // * a series still loading takes no place yet: when it lands the chart remounts in order
      entries={model.series
        .filter(({ hasData }) => hasData)
        .map((entry) => ({
          id: entry.series.id,
          label: entry.series.label,
          palette: getOverlayPalette(entry, rule),
          emphasis: isDimmed(entry.series.id) ? OVERLAY_DIM_OPACITY : 1,
          isHidden: !drawnIds.has(entry.series.id),
        }))}
      rows={buildStandardChartRows(model.series)}
      hasMeanLine={rule.hasMeanLine}
      scales={model.scales}
      rightMax={model.rightMax}
      visible={visible}
      selectedMonths={months !== null && months.length > 0 ? months : undefined}
      activeMonth={activeMonth}
      footer={footer}
    />
  );
}
