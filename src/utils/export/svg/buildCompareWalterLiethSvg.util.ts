import {
  COMPARE_EXPORT_SVG_LAYOUT as L,
  COMPARE_WL_EXPORT_LAYOUT as W,
  EXPORT_LEGEND,
  WALTER_LIETH_EXPORT_TEXT as T,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_DASH,
} from "@/constants";
import { ECompareLayout } from "@/enums";
import type {
  TCompareWalterLiethBody,
  TComparisonExport,
  TExportChartColors,
  TWalterLiethDomain,
  TWalterLiethExportBox,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
} from "@/types";
import {
  getOverlayPaint,
  getSharedDomain,
  getWalterLiethLegendItems,
  getWalterLiethOverlayLegendItems,
  isCompleteSeries,
  isShadedSeries,
  orderShadedFirst,
} from "@/utils";
import { buildSplitPanel, getSplitFrame, patternIdsOf, seriesColor } from "./splitPanelExport.util";
import { buildExportLegend, getWalterLiethExportPalette } from "./legendExport.util";
import {
  buildNotice,
  buildWalterLiethPanel,
  getConventionExportPaint,
} from "./walterLiethExport.util";

const contentLeft = L.paddingX;
const contentWidth = L.width - L.paddingX * 2;

/** The WL plot of one split panel, or the notice when its series is incomplete. */
function renderWalterLiethPlot(
  series: TWalterLiethSeriesInput,
  wl: TComparisonExport,
  { domain, colors }: { domain: TWalterLiethDomain; colors: TExportChartColors },
) {
  return (box: TWalterLiethExportBox) =>
    isCompleteSeries(series)
      ? buildWalterLiethPanel({
          layers: [
            {
              months: series.months,
              patternIds: patternIdsOf(`wl-cmp-${series.id}`),
              paint: getConventionExportPaint(colors),
              isShaded: true,
              dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
            },
          ],
          domain,
          colors,
          box,
          clipId: `wl-cmp-${series.id}-clip`,
          monthLabels: wl.monthLabels,
        })
      : buildNotice({ text: wl.labels.incomplete[series.id], box, colors });
}

function buildSplit(
  wl: TComparisonExport,
  domain: TWalterLiethDomain,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const frame = getSplitFrame(wl, contentWidth);
  const panels = [wl.seriesA, wl.seriesB].map((series, i) =>
    buildSplitPanel({
      series,
      comparison: wl,
      context: {
        colors,
        left: contentLeft + (frame.panelWidth + W.splitGap) * i,
        top,
        ...frame,
      },
      renderPlot: renderWalterLiethPlot(series, wl, { domain, colors }),
    }),
  );

  // * no legend when neither series could be drawn; it sits below the cards, outside them
  const drawn = [wl.seriesA, wl.seriesB].find(isCompleteSeries);
  const legendY = top + frame.panelHeight + EXPORT_LEGEND.GAP;
  const legend = drawn
    ? buildExportLegend({
        items: getWalterLiethLegendItems({
          labels: wl.labels,
          palette: getWalterLiethExportPalette(colors),
        }),
        y: legendY,
        left: contentLeft,
        width: contentWidth,
        textColor: colors.textSecondary,
        idPrefix: "wl-cmp-legend",
      })
    : { svg: "", bottom: legendY };

  return { body: panels.join("") + legend.svg, bottom: legend.bottom };
}

function buildOverlay(
  wl: TComparisonExport,
  pair: readonly [TWalterLiethSeries, TWalterLiethSeries],
  domain: TWalterLiethDomain,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const layers = orderShadedFirst(
    pair.map((series) => ({
      months: series.months,
      patternIds: patternIdsOf(`wl-ovl-${series.id}`),
      paint: getOverlayPaint(seriesColor(series, colors)),
      isShaded: isShadedSeries(series.id, wl.shading),
      dotShape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
      precDash: WALTER_LIETH_DASH.OVERLAY_PREC,
    })),
  );
  const shaded = pair.find((series) => isShadedSeries(series.id, wl.shading));
  const box = {
    left: W.overlayPlotMarginX,
    right: L.width - W.overlayPlotMarginX,
    top,
    bottom: top + W.overlayPlotHeight,
  };
  const legendY = box.bottom + T.MONTH_LABEL_OFFSET + EXPORT_LEGEND.GAP;

  const panel = buildWalterLiethPanel({
    layers,
    domain,
    colors,
    box,
    clipId: "wl-ovl-clip",
    monthLabels: wl.monthLabels,
  });
  const legend = buildExportLegend({
    items: getWalterLiethOverlayLegendItems({
      labels: wl.labels,
      series: pair.map((series) => ({
        key: series.id,
        label: series.label,
        color: seriesColor(series, colors),
        shape: WALTER_LIETH_COMPARISON.DOT_SHAPE[series.id],
      })),
      shadeColor: shaded ? seriesColor(shaded, colors) : null,
      neutral: colors.textSecondary,
    }),
    y: legendY,
    left: contentLeft,
    width: contentWidth,
    textColor: colors.textSecondary,
    idPrefix: "wl-ovl-legend",
  });

  return { body: panel + legend.svg, bottom: legend.bottom };
}

/**
 * Compare export body in WL mode: split panels or one overlay panel, on one shared domain of
 * the complete series — every panel is a buildWalterLiethPanel, as in the single export.
 * Overlay needs both series; otherwise split shows the notice.
 */
export function buildCompareWalterLiethBody(
  wl: TComparisonExport,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const complete = [wl.seriesA, wl.seriesB].filter(isCompleteSeries);
  const domain = getSharedDomain(complete);
  const [completeA, completeB] = complete;
  const pair: readonly [TWalterLiethSeries, TWalterLiethSeries] | null =
    completeA && completeB ? [completeA, completeB] : null;

  return pair && wl.layout === ECompareLayout.OVERLAY
    ? buildOverlay(wl, pair, domain, colors, top)
    : buildSplit(wl, domain, colors, top);
}
