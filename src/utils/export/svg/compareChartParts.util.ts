import {
  CHART_LINE_DASH,
  DEFAULT_BAR_STYLE,
  OVERLAY_BAR_STYLES,
  WALTER_LIETH_EXPORT_TEXT,
} from "@/constants";
import {
  computeAridityPeriods,
  getMarkerPath,
  getOverlayBarFills,
  getOverlayBarLayout,
} from "@/utils";
import { exportHatchId } from "./hatchExport.util";
import type {
  TBarStyle,
  TCompareExportPayload,
  TExportChartColors,
  TGroupedBarsArgs,
  TSeriesLinesArgs,
  TLinearScale,
  TMonthBand,
} from "@/types";
import { buildGapAwarePath } from "./gapPath.util";
import { dotRadius, escapeXml, monthOpacity } from "./buildExportSvg.util";

// * the standard compare chart's parts — shared by the overlay body and the split panels

/** The export's bars in a month: the screen overlay's layout, in the bar style's gap. */
export function getExportBarLayout(
  monthBands: TMonthBand[],
  entityCount: number,
  barStyle: TBarStyle = DEFAULT_BAR_STYLE,
) {
  const { gap, minGap } = OVERLAY_BAR_STYLES[barStyle];
  return getOverlayBarLayout({
    plotWidth: (monthBands[0]?.width ?? 0) * monthBands.length,
    entityCount,
    gap,
    minGap,
  });
}

/**
 * Each series' precipitation bars, side by side in the month band (the shared bar layout, so
 * each series' curve points can sit over its bars), filled by the month's aridity for that
 * series (as on screen); in the overlay as its bar style draws them — the gap, the series'
 * shade, its hatch knocked out of them.
 */
export function buildGroupedBars(
  payload: TCompareExportPayload,
  precScale: TLinearScale,
  monthBands: TMonthBand[],
  chartBottom: number,
  { seriesList = payload.series, barStyle = DEFAULT_BAR_STYLE, hatchPrefix }: TGroupedBarsArgs = {},
): string {
  if (!payload.visibleSeries.prec) return "";

  const layout = getExportBarLayout(monthBands, seriesList.length, barStyle);

  return seriesList
    .flatMap((series, si) => {
      const aridity = computeAridityPeriods(series.data);
      const fills = getOverlayBarFills(barStyle, series.place);
      return series.data.map((row, i) => {
        if (row.prec === null) return "";
        const band = monthBands[i];
        const width = layout.barSize;
        const barX = band.center + (layout.offsets[si] ?? 0) - width / 2;
        const barY = precScale(row.prec);
        const barHeight = Math.max(0, chartBottom - barY);
        const opacity = monthOpacity(row.month, payload.selectedMonths);
        const fill = aridity[i]?.isArid === true ? fills.arid : fills.humid;
        const bar = `<rect x="${barX.toFixed(2)}" y="${barY.toFixed(2)}" width="${width.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${fill}" fill-opacity="${opacity}" rx="1.5" />`;
        if (hatchPrefix === undefined || series.hatch === "solid" || barHeight <= 0) return bar;
        const hatch = `<rect data-bar-hatch="${series.hatch}" x="${barX.toFixed(2)}" y="${barY.toFixed(2)}" width="${width.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="url(#${exportHatchId(hatchPrefix, series.hatch)})" fill-opacity="${opacity}" rx="1.5" />`;
        return bar + hatch;
      });
    })
    .join("");
}

/** One series' tmax/tavg/tmin lines in the semantic colours — dashes match the screen chart
 * (CHART_LINE_DASH): the multi-series ones by default; a split panel passes the single-city
 * chart's. The overlay draws each point in the series' shape. */
export function buildSeriesLines({
  payload,
  series,
  colors,
  tempScale,
  monthBands,
  dash = CHART_LINE_DASH.SERIES,
  hasShapes = false,
  pointOffset = 0,
}: TSeriesLinesArgs): string {
  const lineSpecs: {
    key: "tmax" | "tavg" | "tmin";
    color: string;
    dashArray?: string | undefined;
  }[] = [
    { key: "tmax", color: colors.tmax },
    ...(payload.showTavgLine
      ? [{ key: "tavg" as const, color: colors.tavg, dashArray: dash.tavg }]
      : []),
    {
      key: "tmin",
      color: colors.tmin,
      ...(dash.tmin !== undefined ? { dashArray: dash.tmin } : {}),
    },
  ];

  return lineSpecs
    .map(({ key, color, dashArray }) => {
      if (!payload.visibleSeries[key]) return "";

      // * a missing month is a gap in the line and has no dot — never a 0
      const points = series.data.map((row, i) => {
        const value = row[key];
        // * in the overlay, over the series' own bar: a constant offset from the month's centre
        return value !== null
          ? { x: monthBands[i].center + pointOffset, y: tempScale(value) }
          : null;
      });
      const path = buildGapAwarePath(points);
      const dash = dashArray ? ` stroke-dasharray="${dashArray}"` : "";

      const dots = series.data
        .map((row, i) => {
          const point = points[i];
          if (!point) return "";
          const opacity = monthOpacity(row.month, payload.selectedMonths);
          const radius = dotRadius(row.month, payload.selectedMonths);
          if (!hasShapes) {
            return `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${radius}" fill="${color}" fill-opacity="${opacity}" />`;
          }
          const d = getMarkerPath({
            shape: series.shape,
            cx: point.x,
            cy: point.y,
            size: radius * 2,
          });
          return `<path d="${d}" fill="${color}" fill-opacity="${opacity}" />`;
        })
        .join("");

      return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"${dash} /> ${dots}`;
    })
    .join("\n");
}

export function buildMonthLabels(
  payload: TCompareExportPayload,
  colors: TExportChartColors,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  return payload.labels.monthNames
    .map(
      (name, i) =>
        `<text x="${monthBands[i].center.toFixed(2)}" y="${chartBottom + WALTER_LIETH_EXPORT_TEXT.MONTH_LABEL_OFFSET}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(name)}</text>`,
    )
    .join("");
}
