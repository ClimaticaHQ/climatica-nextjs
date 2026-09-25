import { catmullRomPath } from "@/components/TempPrecipChart/utils/catmullRomPath";
import { COMPARE_EXPORT_SVG_LAYOUT as L } from "@/constants";
import type {
  TCompareExportPayload,
  TCompareExportSeries,
  TCompareExportStatsRow,
  TExportChartColors,
  TFooterTextLine,
  TLinearScale,
  TMonthBand,
  TSvgExportResult,
} from "@/types";
import { buildFooterTextLines } from "../shared/footerLines.util";
import {
  buildGridAndAxes,
  computeNiceAxisTicks,
  dotRadius,
  escapeXml,
  monthOpacity,
} from "./buildExportSvg.util";
import { createLinearScale, monthBandX } from "./scales.util";

function buildHeader(payload: TCompareExportPayload, colors: TExportChartColors): string {
  return `
    <text x="${L.paddingX}" y="${L.headerTitleY}" font-size="24" font-weight="700" fill="${colors.text}">${escapeXml(payload.headerTitle)}</text>
    <text x="${L.paddingX}" y="${L.headerSubtitleY}" font-size="${L.headerSubtitleFontSize}" fill="${colors.textSecondary}">${escapeXml(payload.headerSubtitle)}</text>
    <line x1="${L.paddingX}" y1="${L.headerRuleY}" x2="${L.width - L.paddingX}" y2="${L.headerRuleY}" stroke="${colors.border}" stroke-width="1" />
  `;
}

/** N-column bordered table — the export counterpart to CompareStatsGrid.tsx (2
 * columns) and MultiPeriodStatsTable.tsx (N columns): one shared renderer, since
 * both are structurally identical (label column + one column per series). */
function buildStatsTable(payload: TCompareExportPayload, colors: TExportChartColors): string {
  const { series, labels } = payload;
  const hasAltitude = series.some((s) => s.altitude !== null);

  const rows: TCompareExportStatsRow[] = [
    { label: labels.statsLabels.avgTmax, format: (s) => `${s.stats.avgTmax.toFixed(1)} °C` },
    { label: labels.statsLabels.avgTmin, format: (s) => `${s.stats.avgTmin.toFixed(1)} °C` },
    { label: labels.statsLabels.totalPrec, format: (s) => `${s.stats.totalPrec.toFixed(0)} mm` },
    { label: labels.statsLabels.aridMonths, format: (s) => String(s.stats.aridMonths) },
  ];
  if (hasAltitude) {
    rows.push({
      label: labels.statsLabels.altitude,
      format: (s) => (s.altitude !== null ? `${Math.round(s.altitude)} m` : "—"),
    });
  }
  rows.push({
    label: labels.statsLabels.martonne,
    format: (s) => {
      const value = s.stats.martonneIndex !== null ? s.stats.martonneIndex.toFixed(1) : "—";
      const suffix = s.martonneClassLabel ? ` (${s.martonneClassLabel})` : "";
      return `${value}${suffix}`;
    },
  });

  const tableWidth = L.width - L.paddingX * 2;
  const labelColWidth = 150;
  const dataColWidth = (tableWidth - labelColWidth) / series.length;
  const y0 = L.statsY;
  const tableHeight = L.statsHeaderRowHeight + rows.length * L.statsRowHeight;
  const colX = (i: number) => L.paddingX + labelColWidth + dataColWidth * i;

  const border = `<rect x="${L.paddingX}" y="${y0}" width="${tableWidth}" height="${tableHeight}" fill="none" stroke="${colors.border}" stroke-width="1" />`;

  const vDividers = [
    `<line x1="${L.paddingX + labelColWidth}" y1="${y0}" x2="${L.paddingX + labelColWidth}" y2="${y0 + tableHeight}" stroke="${colors.border}" stroke-width="1" />`,
    ...series.slice(1).map((_, i) => {
      const x = colX(i + 1);
      return `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + tableHeight}" stroke="${colors.border}" stroke-width="1" />`;
    }),
  ].join("");

  const hDividers = rows
    .map((_, i) => {
      const y = y0 + L.statsHeaderRowHeight + L.statsRowHeight * i;
      return `<line x1="${L.paddingX}" y1="${y}" x2="${L.paddingX + tableWidth}" y2="${y}" stroke="${colors.border}" stroke-width="1" />`;
    })
    .join("");

  const headerRow = series
    .map((s, i) => {
      const cx = colX(i) + dataColWidth / 2;
      const cy = y0 + L.statsHeaderRowHeight / 2 + 4;
      return `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="13" font-weight="700" fill="${s.colors.tmax}">${escapeXml(s.label)}</text>`;
    })
    .join("");

  const dataRows = rows
    .map((row, ri) => {
      const rowY = y0 + L.statsHeaderRowHeight + L.statsRowHeight * ri;
      const labelText = `<text x="${L.paddingX + 10}" y="${rowY + L.statsRowHeight / 2 + 4}" font-size="12" fill="${colors.textSecondary}">${escapeXml(row.label)}</text>`;
      const valueTexts = series
        .map((s, i) => {
          const cx = colX(i) + dataColWidth / 2;
          const cy = rowY + L.statsRowHeight / 2 + 4;
          return `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="13" font-weight="600" fill="${s.colors.tmax}">${escapeXml(row.format(s))}</text>`;
        })
        .join("");
      return labelText + valueTexts;
    })
    .join("");

  return border + vDividers + hDividers + headerRow + dataRows;
}

/** One series' precip bar for a given month, offset within the shared month band
 * so 2..N series' bars sit side by side instead of overlapping. */
function buildGroupedBars(
  payload: TCompareExportPayload,
  precScale: TLinearScale,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  if (!payload.visibleSeries.prec) return "";

  const n = payload.series.length;
  const groupWidthRatio = 0.7;

  return payload.series
    .flatMap((series, si) =>
      series.data.map((row, i) => {
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

/** One series' tmax/tavg/tmin lines — dash pattern matches CompareChart/
 * MultiPeriodChart exactly (solid tmax, dashed tavg, dash-dot tmin). */
function buildSeriesLines(
  payload: TCompareExportPayload,
  series: TCompareExportSeries,
  tempScale: TLinearScale,
  monthBands: TMonthBand[],
): string {
  const lineSpecs: { key: "tmax" | "tavg" | "tmin"; color: string; dashArray?: string }[] = [
    { key: "tmax", color: series.colors.tmax },
    ...(payload.showTavgLine
      ? [{ key: "tavg" as const, color: series.colors.tavg, dashArray: "5 3" }]
      : []),
    { key: "tmin", color: series.colors.tmin, dashArray: "4 2" },
  ];

  return lineSpecs
    .map(({ key, color, dashArray }) => {
      if (!payload.visibleSeries[key]) return "";

      const points = series.data.map((row, i) => ({
        x: monthBands[i].center,
        y: tempScale(row[key]),
      }));
      const path = catmullRomPath(points);
      const dash = dashArray ? ` stroke-dasharray="${dashArray}"` : "";

      const dots = series.data
        .map((row, i) => {
          const opacity = monthOpacity(row.month, payload.selectedMonths);
          const radius = dotRadius(row.month, payload.selectedMonths);
          return `<circle cx="${points[i].x.toFixed(2)}" cy="${points[i].y.toFixed(2)}" r="${radius}" fill="${color}" fill-opacity="${opacity}" />`;
        })
        .join("");

      return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"${dash} /> ${dots}`;
    })
    .join("\n");
}

function buildMonthLabels(
  payload: TCompareExportPayload,
  colors: TExportChartColors,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  return payload.labels.monthNames
    .map(
      (name, i) =>
        `<text x="${monthBands[i].center.toFixed(2)}" y="${chartBottom + 20}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(name)}</text>`,
    )
    .join("");
}

/** One color dot + label per series — matches CompareModeLegend/MultiPeriodLegend
 * (a single identity color per series, not one entry per metric). */
function buildLegend(payload: TCompareExportPayload): string {
  const itemWidth = L.width / (payload.series.length + 1);
  let x = itemWidth;

  return payload.series
    .map((series) => {
      const swatch = `<rect x="${x - 7}" y="${L.legendY - 10}" width="10" height="10" fill="${series.colors.tmax}" rx="2" />`;
      const text = `<text x="${x + 8}" y="${L.legendY}" font-size="12" fill="${series.colors.tmax}">${escapeXml(series.label)}</text>`;
      x += itemWidth;
      return swatch + text;
    })
    .join("");
}

function renderFooterLines(lines: TFooterTextLine[], colors: TExportChartColors): string {
  return lines
    .map(({ text, fontSize }, i) => {
      const y = L.footerY + i * L.footerLineHeight;
      return `<text x="${L.paddingX}" y="${y}" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(text)}</text>`;
    })
    .join("\n");
}

export function buildCompareExportSvg(
  payload: TCompareExportPayload,
  colors: TExportChartColors,
): TSvgExportResult {
  const plotLeft = L.chartMarginLeft;
  const plotRight = L.width - L.chartMarginRight;
  const chartBottom = L.chartTop + L.chartHeight;

  const tempScale = createLinearScale(
    payload.scales.tempMin,
    payload.scales.tempMax,
    chartBottom,
    L.chartTop,
  );
  const precScale = createLinearScale(0, payload.rightMax, chartBottom, L.chartTop);

  const monthCount = payload.series[0]?.data.length ?? 12;
  const monthBands = Array.from({ length: monthCount }, (_, i) => {
    const band = monthBandX(i, plotRight - plotLeft, monthCount);
    return { ...band, x: band.x + plotLeft, center: band.center + plotLeft };
  });

  const footerLines = buildFooterTextLines({
    contextLabel: payload.headerSubtitle,
    datasetAttribution: payload.datasetAttribution,
    shareUrl: payload.shareUrl,
    layout: L,
  });
  const height = L.footerY + footerLines.length * L.footerLineHeight + L.footerBottomMargin;

  const body = [
    buildHeader(payload, colors),
    buildStatsTable(payload, colors),
    buildGridAndAxes(
      payload.scales,
      colors,
      tempScale,
      precScale,
      plotLeft,
      plotRight,
      L.chartTop,
      chartBottom,
      computeNiceAxisTicks(payload.rightMax),
      (tick) => tick,
    ),
    buildGroupedBars(payload, precScale, monthBands, chartBottom),
    ...payload.series.map((series) => buildSeriesLines(payload, series, tempScale, monthBands)),
    buildMonthLabels(payload, colors, monthBands, chartBottom),
    `<text x="${(plotLeft + plotRight) / 2}" y="${chartBottom + 40}" text-anchor="middle" font-size="11" font-weight="600" fill="${colors.textSecondary}">${escapeXml(payload.labels.monthAxisLabel)}</text>`,
    buildLegend(payload),
    renderFooterLines(footerLines, colors),
  ].join("\n");

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${height}" viewBox="0 0 ${L.width} ${height}" font-family="Inter, Roboto, Helvetica Neue, Arial, sans-serif">`,
    `<rect width="${L.width}" height="${height}" fill="${colors.bg}" />`,
    body,
    `</svg>`,
  ].join("\n");

  return { svg, height };
}
