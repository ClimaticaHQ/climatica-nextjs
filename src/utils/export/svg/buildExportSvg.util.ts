import {
  EXPORT_SVG_LAYOUT as L,
  EXPORT_AXES_STYLE,
  EXPORT_FONT_FAMILY,
  WALTER_LIETH_EXPORT_TEXT,
  MONTHLY_TABLE,
} from "@/constants";
import type {
  TGridAxesStyle,
  TUnitTitlesArgs,
  TExportChartColors,
  TExportPayload,
  TFooterTextLine,
  TLinearScale,
  TMonthBand,
  TSvgExportResult,
} from "@/types";
import {
  computeWLAxisTicks,
  getSharedDomain,
  getStandardLegendItems,
  getWalterLiethLegendItems,
  toWalterLiethMonths,
  getFrostMonths,
  buildMonthlyTableRows,
} from "@/utils";
import { buildExportLegend, getWalterLiethExportPalette } from "./legendExport.util";
import { buildFooterTextLines } from "../shared/footerLines.util";
import { buildGapAwarePath } from "./gapPath.util";
import { createLinearScale, monthBandX } from "./scales.util";
import {
  buildNotice,
  buildWalterLiethPanel,
  getConventionExportPaint,
} from "./walterLiethExport.util";
import { getSingleExportPlotBox } from "./exportPlotBox.util";
import { buildMonthlyTableSvg } from "./monthlyTableExport.util";

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCoordinate(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function monthOpacity(month: number, selectedMonths: number[] | null): number {
  if (!selectedMonths || selectedMonths.length === 0) return 1;
  return selectedMonths.includes(month) ? 0.8 : 0.15;
}

export function dotRadius(month: number, selectedMonths: number[] | null): number {
  return selectedMonths?.length === 1 && selectedMonths.includes(month) ? 5 : 3;
}

/**
 * Nice round ticks from 0 to max, sized for a target count regardless of range —
 * unlike computeWLAxisTicks (fixed step 5/10, built for the temp axis's small range),
 * this scales its step with the magnitude of max so a monsoon-scale rightMax
 * (~1000+) doesn't produce hundreds of overlapping labels. The actual max is
 * appended as a final tick so the axis's real top boundary is always labeled.
 */
export function computeNiceAxisTicks(max: number, targetCount = 6): number[] {
  if (max <= 0) return [0];

  const roughStep = max / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = [1, 2, 5, 10].find((n) => n >= normalized) ?? 10;
  const step = niceNormalized * magnitude;

  const ticks: number[] = [];
  for (let v = 0; v < max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

function buildHeader(payload: TExportPayload, colors: TExportChartColors): string {
  const { location } = payload;
  const coords = formatCoordinate(location.lat, location.lng);
  const altitudeText = location.altitude !== null ? ` · ${Math.round(location.altitude)} m` : "";
  const subtitle = `${coords}${altitudeText} · ${payload.labels.periodLabel}`;

  return `
    <text x="${L.paddingX}" y="${L.headerTitleY}" font-size="24" font-weight="700" fill="${colors.text}">${escapeXml(location.cityName)}</text>
    <text x="${L.paddingX}" y="${L.headerSubtitleY}" font-size="${L.headerSubtitleFontSize}" fill="${colors.textSecondary}">${escapeXml(subtitle)}</text>
    <line x1="${L.paddingX}" y1="${L.headerRuleY}" x2="${L.width - L.paddingX}" y2="${L.headerRuleY}" stroke="${colors.border}" stroke-width="1" />
  `;
}

function buildStatsTable(payload: TExportPayload, colors: TExportChartColors): string {
  const { summary, location, labels } = payload;
  const cells: [string, string][] = [
    [labels.statsLabels.meanTemp, `${summary.annualAvgTemp.toFixed(1)}°C`],
    [labels.statsLabels.annualPrec, `${summary.totalPrec} mm`],
    [labels.statsLabels.aridMonths, String(summary.aridCount)],
  ];
  if (location.altitude !== null) {
    cells.push([labels.statsLabels.altitude, `${Math.round(location.altitude)} m`]);
  }
  const martonneValue = summary.martonne !== null ? summary.martonne.toFixed(1) : "—";
  const martonneSuffix = labels.martonneClassLabel ? ` (${labels.martonneClassLabel})` : "";
  cells.push([labels.statsLabels.martonne, `${martonneValue}${martonneSuffix}`]);

  const tableWidth = L.width - L.paddingX * 2;
  const cellWidth = tableWidth / cells.length;
  const y0 = L.statsY;
  const y1 = y0 + L.statsHeight;

  const border = `<rect x="${L.paddingX}" y="${y0}" width="${tableWidth}" height="${L.statsHeight}" fill="none" stroke="${colors.border}" stroke-width="1" />`;
  const dividers = cells
    .slice(1)
    .map((_, i) => {
      const x = L.paddingX + cellWidth * (i + 1);
      return `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${colors.border}" stroke-width="1" />`;
    })
    .join("");
  const content = cells
    .map(([label, value], i) => {
      const cx = L.paddingX + cellWidth * i + cellWidth / 2;
      return `
        <text x="${cx}" y="${y0 + 20}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(label)}</text>
        <text x="${cx}" y="${y0 + 40}" text-anchor="middle" font-size="16" font-weight="600" fill="${colors.text}">${escapeXml(value)}</text>
      `;
    })
    .join("");

  return border + dividers + content;
}

/**
 * precTicks are raw-mm label values; toScalePos maps a raw-mm tick to whatever value
 * precScale's own domain expects, since that differs by mode — standard mode's precScale
 * domain is already raw mm (identity), while Walter-Lieth mode's precScale shares the
 * temp-equivalent scaled domain (tempMin..plotMax), so its ticks go through toPrecipAxisValue.
 */
export function buildGridAndAxes(
  scales: { tempMin: number; tempMax: number },
  colors: TExportChartColors,
  tempScale: TLinearScale,
  precScale: TLinearScale,
  plotLeft: number,
  plotRight: number,
  chartTop: number,
  chartBottom: number,
  precTicks: number[],
  toScalePos: (tick: number) => number,
  // * WL passes its own (adds the tempMax tick); other charts keep the default steps
  tempTicks: number[] = computeWLAxisTicks(scales.tempMin, scales.tempMax),
  axesStyle: TGridAxesStyle = EXPORT_AXES_STYLE,
): string {
  const { tickGap } = axesStyle;
  const gridLines = tempTicks
    .map((tick) => {
      const y = tempScale(tick);
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="${colors.border}" stroke-width="1" stroke-dasharray="3 3" />`;
    })
    .join("");

  const tempLabels = tempTicks
    .map((tick) => {
      const y = tempScale(tick);
      return `<text x="${plotLeft - tickGap}" y="${y + 4}" text-anchor="end" font-size="11" fill="${colors.textSecondary}">${Math.round(tick)}</text>`;
    })
    .join("");

  const precLabels = precTicks
    .map((tick) => {
      const y = precScale(toScalePos(tick));
      return `<text x="${plotRight + tickGap}" y="${y + 4}" text-anchor="start" font-size="11" fill="${colors.textSecondary}">${Math.round(tick)}</text>`;
    })
    .join("");

  return `
    ${gridLines}
    <line x1="${plotLeft}" y1="${chartBottom}" x2="${plotRight}" y2="${chartBottom}" stroke="${colors.border}" stroke-width="1" />
    ${tempLabels}
    ${precLabels}
    ${buildUnitTitles({ plotLeft, plotRight, chartTop, colors, axesStyle })}
  `;
}

/** °C / mm upright above the axes, aligned with the tick labels — as on screen. */
function buildUnitTitles({ plotLeft, plotRight, chartTop, colors, axesStyle }: TUnitTitlesArgs) {
  const font = `font-size="11" font-weight="600" fill="${colors.textSecondary}"`;
  const y = chartTop - axesStyle.unitTitlesAbove;
  return `
    <text x="${plotLeft - axesStyle.tickGap}" y="${y}" text-anchor="end" ${font}>°C</text>
    <text x="${plotRight + axesStyle.tickGap}" y="${y}" text-anchor="start" ${font}>mm</text>`;
}

function buildBars(
  payload: TExportPayload,
  colors: TExportChartColors,
  precScale: TLinearScale,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  if (!payload.visibleSeries.prec) return "";

  return payload.monthlyData
    .map((row, i) => {
      if (row.prec === null) return "";
      const band = monthBands[i];
      const isArid = payload.aridity[i]?.isArid === true;
      const barWidth = band.width * 0.6;
      const barX = band.center - barWidth / 2;
      const barY = precScale(row.prec);
      const barHeight = Math.max(0, chartBottom - barY);
      const opacity = monthOpacity(row.month, payload.selectedMonths);
      const fill = isArid ? colors.arid : colors.humid;
      return `<rect x="${barX.toFixed(2)}" y="${barY.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${fill}" fill-opacity="${opacity}" rx="2" />`;
    })
    .join("");
}

function buildLine(
  payload: TExportPayload,
  color: string,
  key: "tmax" | "tmin" | "tavg",
  tempScale: TLinearScale,
  monthBands: TMonthBand[],
): string {
  if (!payload.visibleSeries[key]) return "";

  // * a missing month is a gap in the line and has no dot — never a 0
  const points = payload.monthlyData.map((row, i) => {
    const value = row[key];
    return value !== null ? { x: monthBands[i].center, y: tempScale(value) } : null;
  });
  const path = buildGapAwarePath(points);
  const dashArray = key === "tavg" ? ' stroke-dasharray="5 3"' : "";

  const dots = payload.monthlyData
    .map((row, i) => {
      const point = points[i];
      if (!point) return "";
      const opacity = monthOpacity(row.month, payload.selectedMonths);
      const radius = dotRadius(row.month, payload.selectedMonths);
      return `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${radius}" fill="${color}" fill-opacity="${opacity}" />`;
    })
    .join("");

  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"${dashArray} /> ${dots}`;
}

/** Standard chart's plot area: grid/axes sized off payload.rightMax, plus precip bars and tmax/tavg/tmin lines. */
function buildStandardBody(
  payload: TExportPayload,
  colors: TExportChartColors,
  tempScale: TLinearScale,
  plotLeft: number,
  plotRight: number,
  chartBottom: number,
  monthBands: TMonthBand[],
): string {
  const precScale = createLinearScale(0, payload.rightMax, chartBottom, L.chartTop);

  return [
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
      undefined,
      // * the WL plot's axes: °C / mm above them, like the screen
      EXPORT_AXES_STYLE,
    ),
    buildBars(payload, colors, precScale, monthBands, chartBottom),
    buildLine(payload, colors.tmax, "tmax", tempScale, monthBands),
    buildLine(payload, colors.tavg, "tavg", tempScale, monthBands),
    buildLine(payload, colors.tmin, "tmin", tempScale, monthBands),
  ].join("\n");
}

// * ids are fixed: the single-city export holds exactly one WL plot
const WL_EXPORT_IDS = {
  patternIds: { humid: "wl-export-humid", arid: "wl-export-arid" },
  clipId: "wl-export-plot-clip",
};

/**
 * Walter-Lieth plot area — one convention-colored layer in a buildWalterLiethPanel, the same
 * panel the compare export uses. Domain = getSharedDomain for this one series, exactly what
 * the live diagram uses.
 */
function buildWalterLiethBody(
  payload: TExportPayload,
  colors: TExportChartColors,
  plotLeft: number,
  plotRight: number,
  chartBottom: number,
): string {
  const box = { left: plotLeft, right: plotRight, top: L.chartTop, bottom: chartBottom };
  const months = toWalterLiethMonths(payload.monthlyData);
  if (!months) return buildNotice({ text: payload.labels.walterLiethIncomplete, box, colors });

  return buildWalterLiethPanel({
    layers: [
      {
        months,
        patternIds: WL_EXPORT_IDS.patternIds,
        paint: getConventionExportPaint(colors),
        isShaded: true,
        dotShape: "circle",
      },
    ],
    domain: getSharedDomain([{ months }]),
    colors,
    box,
    clipId: WL_EXPORT_IDS.clipId,
    frost: getFrostMonths(months),
  });
}

function buildMonthLabels(
  payload: TExportPayload,
  colors: TExportChartColors,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  return payload.labels.monthNames
    .map((name, i) => {
      return `<text x="${monthBands[i].center.toFixed(2)}" y="${chartBottom + WALTER_LIETH_EXPORT_TEXT.MONTH_LABEL_OFFSET}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(name)}</text>`;
    })
    .join("");
}

/** The single-city legend — the same items ChartLegend shows for this chart type. */
function buildLegend(payload: TExportPayload, colors: TExportChartColors, isWalterLieth: boolean) {
  const { seriesLabels, aridityLegend } = payload.labels;
  const items = isWalterLieth
    ? getWalterLiethLegendItems({
        labels: { ...aridityLegend, temp: seriesLabels.tavg, prec: seriesLabels.prec },
        palette: getWalterLiethExportPalette(colors),
      })
    : getStandardLegendItems({
        labels: { ...seriesLabels, ...aridityLegend },
        colors: { tmax: colors.tmax, tmin: colors.tmin, tavg: colors.tavg, prec: colors.humid },
        visible: payload.visibleSeries,
        aridity: { arid: colors.arid, humid: colors.humid },
      });
  return buildExportLegend({
    items,
    y: L.legendY,
    left: L.paddingX,
    width: L.width - L.paddingX * 2,
    textColor: colors.textSecondary,
    idPrefix: "export-legend",
  }).svg;
}

/** The monthly table — the city page's rows (mean temperature, precipitation) as SVG. */
function buildDataTable(payload: TExportPayload, colors: TExportChartColors): string {
  return buildMonthlyTableSvg({
    rows: buildMonthlyTableRows({
      series: [{ key: "single", data: payload.monthlyData }],
      variables: MONTHLY_TABLE.CITY_VARIABLES,
      labels: payload.labels.tableLabels,
    }),
    monthNames: payload.labels.monthNames,
    top: L.dataTableY,
    left: L.paddingX,
    width: L.width - L.paddingX * 2,
    colors,
  }).svg;
}

function renderFooterLines(lines: TFooterTextLine[], colors: TExportChartColors): string {
  return lines
    .map(({ text, fontSize }, i) => {
      const y = L.footerY + i * L.footerLineHeight;
      return `<text x="${L.paddingX}" y="${y}" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(text)}</text>`;
    })
    .join("\n");
}

export function buildExportSvg(
  payload: TExportPayload,
  colors: TExportChartColors,
): TSvgExportResult {
  const {
    left: plotLeft,
    right: plotRight,
    bottom: chartBottom,
  } = getSingleExportPlotBox(L.chartTop);
  const isWalterLieth = payload.chartMode === "walter-lieth";

  // Standard mode only — Walter-Lieth builds its own scale from getSharedDomain.
  const tempScale = createLinearScale(
    payload.scales.tempMin,
    payload.scales.tempMax,
    chartBottom,
    L.chartTop,
  );
  const monthBands = payload.monthlyData.map((_, i) =>
    monthBandX(i, plotRight - plotLeft, payload.monthlyData.length),
  );
  const shiftedBands = monthBands.map((band) => ({
    ...band,
    x: band.x + plotLeft,
    center: band.center + plotLeft,
  }));

  const plotBody = isWalterLieth
    ? buildWalterLiethBody(payload, colors, plotLeft, plotRight, chartBottom)
    : buildStandardBody(payload, colors, tempScale, plotLeft, plotRight, chartBottom, shiftedBands);

  const footerLines = buildFooterTextLines({
    contextLabel: payload.labels.periodLabel,
    datasetAttribution: payload.datasetAttribution,
    shareUrl: payload.shareUrl,
    layout: L,
  });
  const height = L.footerY + footerLines.length * L.footerLineHeight + L.footerBottomMargin;

  const body = [
    buildHeader(payload, colors),
    buildStatsTable(payload, colors),
    plotBody,
    buildMonthLabels(payload, colors, shiftedBands, chartBottom),
    buildLegend(payload, colors, isWalterLieth),
    buildDataTable(payload, colors),
    renderFooterLines(footerLines, colors),
  ].join("\n");

  // Built as a joined array, not a single multi-line template literal — a raw
  // multi-line template is fragile here because Prettier can re-indent the
  // literal's surrounding return statement, which inserts whitespace BEFORE
  // <?xml ...?>. The XML spec requires the declaration to be the document's
  // very first character, so that whitespace breaks every consumer's parser.
  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${height}" viewBox="0 0 ${L.width} ${height}" font-family="${EXPORT_FONT_FAMILY}">`,
    `<rect width="${L.width}" height="${height}" fill="${colors.bg}" />`,
    body,
    `</svg>`,
  ].join("\n");

  return { svg, height };
}
