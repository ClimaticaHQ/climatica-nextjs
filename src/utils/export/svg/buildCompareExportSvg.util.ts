import {
  COMPARE_EXPORT_SVG_LAYOUT as L,
  COMPARE_WL_EXPORT_LAYOUT as W,
  EXPORT_FONT_FAMILY,
  EXPORT_LEGEND,
  EXPORT_MONTHLY_TABLE,
  WALTER_LIETH_COMPARISON,
  WALTER_LIETH_DIAGRAM,
  EXPORT_AXES_STYLE,
  WALTER_LIETH_EXPORT_TEXT as T,
} from "@/constants";
import { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type {
  TCompareExportPayload,
  TCompareWalterLiethBody,
  TCompareExportStatsRow,
  TExportChartColors,
  TFooterTextLine,
  TLegendMarkerShape,
  TSvgExportResult,
} from "@/types";
import {
  buildMonthlyTableRows,
  getMonthlyTableVariables,
  getSeriesLegendItems,
  isSplitComparison,
} from "@/utils";
import { formatCount, formatPrec, formatTemp } from "../../monthlyClimate.util";
import { buildFooterTextLines } from "../shared/footerLines.util";
import { buildGridAndAxes, computeNiceAxisTicks, escapeXml } from "./buildExportSvg.util";
import { buildCompareWalterLiethBody } from "./buildCompareWalterLiethSvg.util";
import { buildStandardSplitBody } from "./buildStandardSplitSvg.util";
import { buildExportLegend } from "./legendExport.util";
import { buildGroupedBars, buildMonthLabels, buildSeriesLines } from "./compareChartParts.util";
import { buildMonthlyTableSvg } from "./monthlyTableExport.util";
import { createLinearScale, monthBandX } from "./scales.util";

// * weather years have no A/B identity: each is a circle in its own color, as in its legend
const WEATHER_YEAR_MARKER: TLegendMarkerShape = "circle";

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
    { label: labels.statsLabels.avgTmax, format: (s) => formatTemp(s.stats.avgTmax) },
    { label: labels.statsLabels.avgTmin, format: (s) => formatTemp(s.stats.avgTmin) },
    { label: labels.statsLabels.totalPrec, format: (s) => formatPrec(s.stats.totalPrec) },
    { label: labels.statsLabels.aridMonths, format: (s) => formatCount(s.stats.aridMonths) },
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

/** The overlay / multi-period legend — the same items ChartLegend shows for these charts. */
function buildLegend(payload: TCompareExportPayload, colors: TExportChartColors, y: number) {
  return buildExportLegend({
    items: getSeriesLegendItems({
      labels: payload.labels.seriesLabels,
      series: payload.series.map((series) => ({
        key: series.label,
        label: series.label,
        color: series.colors.tmax,
      })),
      visible: payload.visibleSeries,
      neutral: colors.textSecondary,
      hasTavg: payload.showTavgLine,
      // * compare pages never recolor bars by aridity
      aridity: null,
    }),
    y,
    left: L.paddingX,
    width: L.width - L.paddingX * 2,
    textColor: colors.textSecondary,
    idPrefix: "cmp-legend",
  });
}

function renderFooterLines(
  lines: TFooterTextLine[],
  colors: TExportChartColors,
  footerY: number,
): string {
  return lines
    .map(({ text, fontSize }, i) => {
      const y = footerY + i * L.footerLineHeight;
      return `<text x="${L.paddingX}" y="${y}" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(text)}</text>`;
    })
    .join("\n");
}

/**
 * The standard overlay / multi-period chart in the WL overlay's geometry: the same plot box,
 * °C / mm above the axes, no month axis title, the legend the same gap below the months.
 */
function buildStandardChartBody(
  payload: TCompareExportPayload,
  colors: TExportChartColors,
  top: number,
): TCompareWalterLiethBody {
  const plotLeft = W.overlayPlotMarginX;
  const plotRight = L.width - W.overlayPlotMarginX;
  const chartBottom = top + W.overlayPlotHeight;
  const tempScale = createLinearScale(
    payload.scales.tempMin,
    payload.scales.tempMax,
    chartBottom,
    top,
  );
  const precScale = createLinearScale(0, payload.rightMax, chartBottom, top);
  const monthCount = payload.series[0]?.data.length ?? WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR;
  const monthBands = Array.from({ length: monthCount }, (_, i) => {
    const band = monthBandX(i, plotRight - plotLeft, monthCount);
    return { ...band, x: band.x + plotLeft, center: band.center + plotLeft };
  });
  const legend = buildLegend(
    payload,
    colors,
    chartBottom + T.MONTH_LABEL_OFFSET + EXPORT_LEGEND.GAP,
  );

  const body = [
    buildGridAndAxes(
      payload.scales,
      colors,
      tempScale,
      precScale,
      plotLeft,
      plotRight,
      top,
      chartBottom,
      computeNiceAxisTicks(payload.rightMax),
      (tick) => tick,
      undefined,
      EXPORT_AXES_STYLE,
    ),
    buildGroupedBars(payload, precScale, monthBands, chartBottom),
    ...payload.series.map((series) => buildSeriesLines(payload, series, tempScale, monthBands)),
    buildMonthLabels(payload, colors, monthBands, chartBottom),
    legend.svg,
  ].join("\n");
  return { body, bottom: legend.bottom };
}

/** The chart body the page shows: WL (split or overlay), standard split, or standard overlay. */
function buildChartBody(payload: TCompareExportPayload, colors: TExportChartColors, top: number) {
  const { comparison } = payload;
  if (comparison?.chartMode === "walter-lieth") {
    return buildCompareWalterLiethBody(comparison, colors, top);
  }
  return comparison?.layout === ECompareLayout.SPLIT
    ? buildStandardSplitBody(payload, comparison, colors, top)
    : buildStandardChartBody(payload, colors, top);
}

/**
 * The monthly table under the chart, as on the page: every series, or only the expanded split
 * panel's; WL's two variables, or the standard chart's chips.
 */
function buildTable(payload: TCompareExportPayload, colors: TExportChartColors, top: number) {
  const { comparison } = payload;
  const series = payload.series.flatMap((series, i) => {
    // * two-series comparisons are always [A, B]; weather years are circles in their colors
    const id = i === 0 ? EWalterLiethSeriesId.A : EWalterLiethSeriesId.B;
    if (comparison?.expanded && comparison.expanded !== id) return [];
    const marker = comparison
      ? {
          shape: WALTER_LIETH_COMPARISON.DOT_SHAPE[id],
          color: id === EWalterLiethSeriesId.A ? colors.wlSeriesA : colors.wlSeriesB,
        }
      : { shape: WEATHER_YEAR_MARKER, color: series.colors.tmax };
    return [{ key: `${i}`, label: series.label, marker, data: series.data }];
  });
  return buildMonthlyTableSvg({
    rows: buildMonthlyTableRows({
      series,
      variables: getMonthlyTableVariables({
        chartMode: comparison?.chartMode ?? "standard",
        visible: payload.visibleSeries,
      }),
      labels: payload.labels.tableLabels,
    }),
    monthNames: payload.labels.monthNames,
    top,
    left: L.paddingX,
    width: L.width - L.paddingX * 2,
    colors,
  });
}

/** The stats table on top: gone for split panels (their headers carry the stats), as on screen. */
function hasStatsTable({ comparison }: TCompareExportPayload) {
  return !comparison || !isSplitComparison(comparison);
}

export function buildCompareExportSvg(
  payload: TCompareExportPayload,
  colors: TExportChartColors,
): TSvgExportResult {
  const footerLines = buildFooterTextLines({
    contextLabel: payload.headerSubtitle,
    datasetAttribution: payload.datasetAttribution,
    shareUrl: payload.shareUrl,
    layout: L,
  });
  // * every body sets its own height (panels, legend rows); the table and footer follow it
  const showStats = hasStatsTable(payload);
  const chartBody = buildChartBody(
    payload,
    colors,
    showStats ? L.chartTop : L.chartTopWithoutStats,
  );
  const table = buildTable(payload, colors, chartBody.bottom + EXPORT_MONTHLY_TABLE.GAP_ABOVE);
  const footerY = table.bottom + W.footerGap;
  const height = footerY + footerLines.length * L.footerLineHeight + L.footerBottomMargin;

  const body = [
    buildHeader(payload, colors),
    showStats ? buildStatsTable(payload, colors) : "",
    chartBody.body,
    table.svg,
    renderFooterLines(footerLines, colors, footerY),
  ].join("\n");

  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${height}" viewBox="0 0 ${L.width} ${height}" font-family="${EXPORT_FONT_FAMILY}">`,
    `<rect width="${L.width}" height="${height}" fill="${colors.bg}" />`,
    body,
    `</svg>`,
  ].join("\n");

  return { svg, height };
}
