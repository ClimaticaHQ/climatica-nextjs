import { CHART_LINE_DASH, WALTER_LIETH_EXPORT_TEXT } from "@/constants";
import type {
  TCompareExportPayload,
  TCompareExportSeries,
  TExportChartColors,
  TLineDash,
  TLinearScale,
  TMonthBand,
} from "@/types";
import { buildGapAwarePath } from "./gapPath.util";
import { dotRadius, escapeXml, monthOpacity } from "./buildExportSvg.util";

// * the standard compare chart's parts — shared by the overlay body and the split panels

/** One series' precip bar for a given month, offset within the shared month band
 * so 2..N series' bars sit side by side instead of overlapping. */
export function buildGroupedBars(
  payload: TCompareExportPayload,
  precScale: TLinearScale,
  monthBands: TMonthBand[],
  chartBottom: number,
  // * a split panel draws one series' bars
  seriesList: readonly TCompareExportSeries[] = payload.series,
): string {
  if (!payload.visibleSeries.prec) return "";

  const n = seriesList.length;
  const groupWidthRatio = 0.7;

  return seriesList
    .flatMap((series, si) =>
      series.data.map((row, i) => {
        if (row.prec === null) return "";
        const band = monthBands[i];
        const groupWidth = band.width * groupWidthRatio;
        const barWidth = groupWidth / n;
        const barX = band.center - groupWidth / 2 + barWidth * si;
        const barY = precScale(row.prec);
        const barHeight = Math.max(0, chartBottom - barY);
        const opacity = monthOpacity(row.month, payload.selectedMonths);
        return `<rect x="${barX.toFixed(2)}" y="${barY.toFixed(2)}" width="${(barWidth * 0.85).toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${series.colors.prec}" fill-opacity="${opacity}" rx="1.5" />`;
      }),
    )
    .join("");
}

/** One series' tmax/tavg/tmin lines — dashes match the screen chart (CHART_LINE_DASH): the
 * multi-series ones by default; a split panel passes the single-city chart's. */
export function buildSeriesLines(
  payload: TCompareExportPayload,
  series: TCompareExportSeries,
  tempScale: TLinearScale,
  monthBands: TMonthBand[],
  dash: TLineDash = CHART_LINE_DASH.SERIES,
): string {
  const lineSpecs: {
    key: "tmax" | "tavg" | "tmin";
    color: string;
    dashArray?: string | undefined;
  }[] = [
    { key: "tmax", color: series.colors.tmax },
    ...(payload.showTavgLine
      ? [
          {
            key: "tavg" as const,
            color: series.colors.tavg,
            dashArray: dash.tavg,
          },
        ]
      : []),
    {
      key: "tmin",
      color: series.colors.tmin,
      ...(dash.tmin !== undefined ? { dashArray: dash.tmin } : {}),
    },
  ];

  return lineSpecs
    .map(({ key, color, dashArray }) => {
      if (!payload.visibleSeries[key]) return "";

      // * a missing month is a gap in the line and has no dot — never a 0
      const points = series.data.map((row, i) => {
        const value = row[key];
        return value !== null ? { x: monthBands[i].center, y: tempScale(value) } : null;
      });
      const path = buildGapAwarePath(points);
      const dash = dashArray ? ` stroke-dasharray="${dashArray}"` : "";

      const dots = series.data
        .map((row, i) => {
          const point = points[i];
          if (!point) return "";
          const opacity = monthOpacity(row.month, payload.selectedMonths);
          const radius = dotRadius(row.month, payload.selectedMonths);
          return `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${radius}" fill="${color}" fill-opacity="${opacity}" />`;
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
