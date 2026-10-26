import { WalterLiethOverlay } from "./WalterLiethOverlay";
import { EChartBody } from "@/enums";
import {
  getAridityByMonth,
  getEntityBarSwatch,
  getOverlayBarFills,
  getSwatchBarStyle,
  isCompleteSeries,
} from "@/utils";
import type { TOverlayChartProps } from "./charts.type";
import { buildStandardChartRows, getSeriesMarker, getShadedId } from "./charts.util";
import { StandardChart } from "./StandardChart";

/**
 * The overlay's chart: every drawn series in one Walter-Lieth diagram (a highlighted series
 * dims the others), or in the standard chart (series turned off by their chips are hidden; a
 * highlighted one is focused, the rest turn gray).
 */
export function OverlayChart({
  model,
  rule,
  viewState,
  barStyle,
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
      <WalterLiethOverlay
        entries={drawn.flatMap((entry) =>
          isCompleteSeries(entry.walterLieth)
            ? [
                {
                  key: entry.series.id,
                  series: entry.walterLieth,
                  shape: entry.series.shape,
                  isShaded: entry.series.id === shadedId,
                  isDimmed: isDimmed(entry.series.id),
                  marker: getSeriesMarker(entry),
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
  const swatchStyle = getSwatchBarStyle({
    mode: "standard",
    body: EChartBody.OVERLAY,
    barStyle,
    isPrecVisible: visible.prec,
  });
  const months = viewState.selectedMonths;
  return (
    <StandardChart
      // * a series still loading takes no place yet: when it lands the chart remounts in order
      entries={model.series.flatMap((entry) =>
        entry.hasData
          ? [
              {
                id: entry.series.id,
                label: entry.series.label,
                aridityByMonth: getAridityByMonth(entry.aridity),
                // * its own slot's shade, never its place in the list
                barFills: getOverlayBarFills(barStyle, entry.series.markerSlot),
                hatch: entry.series.hatch,
                swatch: getEntityBarSwatch(
                  swatchStyle,
                  entry.series.hatch,
                  entry.series.markerSlot,
                ),
                isHidden: !drawnIds.has(entry.series.id),
                marker: getSeriesMarker(entry),
              },
            ]
          : [],
      )}
      barStyle={barStyle}
      rows={buildStandardChartRows(model.series)}
      hasMeanLine={rule.hasMeanLine}
      scales={model.scales}
      rightMax={model.rightMax}
      visible={visible}
      highlightedId={highlightedId}
      selectedMonths={months !== null && months.length > 0 ? months : undefined}
      activeMonth={activeMonth}
      footer={footer}
    />
  );
}
