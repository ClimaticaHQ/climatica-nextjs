import { catmullRomPath } from "@/components/TempPrecipChart/utils/catmullRomPath";
import type { TExportChartColors, TExportPayload, TLinearScale, TMonthBand } from "@/types";
import { computeWLAxisTicks } from "@/utils";
import { EXPORT_SVG_LAYOUT as L } from "./exportSvg.constant";
import { createLinearScale, monthBandX } from "./scales.util";

function escapeXml(text: string): string {
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

function monthOpacity(month: number, selectedMonths: number[] | null): number {
  if (!selectedMonths || selectedMonths.length === 0) return 1;
  return selectedMonths.includes(month) ? 0.8 : 0.15;
}

function dotRadius(month: number, selectedMonths: number[] | null): number {
  return selectedMonths?.length === 1 && selectedMonths.includes(month) ? 5 : 3;
}

function buildHeader(payload: TExportPayload, colors: TExportChartColors): string {
  const { location } = payload;
  const coords = formatCoordinate(location.lat, location.lng);
  const altitudeText = location.altitude !== null ? ` · ${Math.round(location.altitude)} m` : "";
  const subtitle = `${coords}${altitudeText} · ${payload.labels.periodLabel}`;

  return `
    <text x="${L.paddingX}" y="${L.headerTitleY}" font-size="24" font-weight="700" fill="${colors.text}">${escapeXml(location.cityName)}</text>
    <text x="${L.paddingX}" y="${L.headerSubtitleY}" font-size="13" fill="${colors.textSecondary}">${escapeXml(subtitle)}</text>
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

function buildGridAndAxes(
  payload: TExportPayload,
  colors: TExportChartColors,
  tempScale: TLinearScale,
  precScale: TLinearScale,
  plotLeft: number,
  plotRight: number,
  chartBottom: number,
): string {
  const tempTicks = computeWLAxisTicks(payload.scales.tempMin, payload.scales.tempMax);
  const precTicks = computeWLAxisTicks(0, payload.rightMax);

  const gridLines = tempTicks
    .map((tick) => {
      const y = tempScale(tick);
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="${colors.border}" stroke-width="1" stroke-dasharray="3 3" />`;
    })
    .join("");

  const tempLabels = tempTicks
    .map((tick) => {
      const y = tempScale(tick);
      return `<text x="${plotLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${colors.textSecondary}">${Math.round(tick)}</text>`;
    })
    .join("");

  const precLabels = precTicks
    .map((tick) => {
      const y = precScale(tick);
      return `<text x="${plotRight + 10}" y="${y + 4}" text-anchor="start" font-size="11" fill="${colors.textSecondary}">${Math.round(tick)}</text>`;
    })
    .join("");

  const midY = (L.chartTop + chartBottom) / 2;
  const tempTitleX = plotLeft - 45;
  const precTitleX = plotRight + 45;

  return `
    ${gridLines}
    <line x1="${plotLeft}" y1="${chartBottom}" x2="${plotRight}" y2="${chartBottom}" stroke="${colors.border}" stroke-width="1" />
    ${tempLabels}
    ${precLabels}
    <text x="${tempTitleX}" y="${midY}" text-anchor="middle" font-size="11" font-weight="600" fill="${colors.textSecondary}" transform="rotate(-90 ${tempTitleX} ${midY})">°C</text>
    <text x="${precTitleX}" y="${midY}" text-anchor="middle" font-size="11" font-weight="600" fill="${colors.textSecondary}" transform="rotate(90 ${precTitleX} ${midY})">mm</text>
  `;
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
      const band = monthBands[i];
      const isArid = payload.aridity[i]?.isArid ?? false;
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

  const points = payload.monthlyData.map((row, i) => ({
    x: monthBands[i].center,
    y: tempScale(row[key]),
  }));
  const path = catmullRomPath(points);
  const dashArray = key === "tavg" ? ' stroke-dasharray="5 3"' : "";

  const dots = payload.monthlyData
    .map((row, i) => {
      const opacity = monthOpacity(row.month, payload.selectedMonths);
      const radius = dotRadius(row.month, payload.selectedMonths);
      return `<circle cx="${points[i].x.toFixed(2)}" cy="${points[i].y.toFixed(2)}" r="${radius}" fill="${color}" fill-opacity="${opacity}" />`;
    })
    .join("");

  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"${dashArray} /> ${dots}`;
}

function buildMonthLabels(
  payload: TExportPayload,
  colors: TExportChartColors,
  monthBands: TMonthBand[],
  chartBottom: number,
): string {
  return payload.labels.monthNames
    .map((name, i) => {
      return `<text x="${monthBands[i].center.toFixed(2)}" y="${chartBottom + 20}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(name)}</text>`;
    })
    .join("");
}

function buildLegend(payload: TExportPayload, colors: TExportChartColors): string {
  const allEntries: { key: "tmax" | "tmin" | "tavg" | "prec"; color: string; label: string }[] = [
    { key: "tmax", color: colors.tmax, label: payload.labels.seriesLabels.tmax },
    { key: "tavg", color: colors.tavg, label: payload.labels.seriesLabels.tavg },
    { key: "tmin", color: colors.tmin, label: payload.labels.seriesLabels.tmin },
    { key: "prec", color: colors.humid, label: payload.labels.seriesLabels.prec },
  ];
  const entries = allEntries.filter((entry) => payload.visibleSeries[entry.key]);

  const itemWidth = 150;
  const totalWidth = entries.length * itemWidth;
  let x = (L.width - totalWidth) / 2;

  return entries
    .map((entry) => {
      const swatch =
        entry.key === "prec"
          ? `<rect x="${x}" y="${L.legendY - 9}" width="14" height="10" fill="${entry.color}" rx="2" />`
          : `<line x1="${x}" y1="${L.legendY - 4}" x2="${x + 14}" y2="${L.legendY - 4}" stroke="${entry.color}" stroke-width="2" />`;
      const text = `<text x="${x + 20}" y="${L.legendY}" font-size="12" fill="${colors.text}">${escapeXml(entry.label)}</text>`;
      x += itemWidth;
      return swatch + text;
    })
    .join("");
}

/** Matches AridityLegend.tsx — only shown when precip bars are visible, since the
 * arid/humid coloring only applies to those bars (StandardClimateChart.tsx). */
function buildAridityLegend(payload: TExportPayload, colors: TExportChartColors): string {
  if (!payload.visibleSeries.prec) return "";

  const entries: { color: string; label: string }[] = [
    { color: colors.arid, label: payload.labels.aridityLegend.arid },
    { color: colors.humid, label: payload.labels.aridityLegend.humid },
  ];
  const itemWidth = 130;
  const totalWidth = entries.length * itemWidth;
  let x = (L.width - totalWidth) / 2;

  return entries
    .map(({ color, label }) => {
      const swatch = `<rect x="${x}" y="${L.aridityLegendY - 9}" width="12" height="12" fill="${color}" rx="2" />`;
      const text = `<text x="${x + 18}" y="${L.aridityLegendY}" font-size="11" fill="${colors.textSecondary}">${escapeXml(label)}</text>`;
      x += itemWidth;
      return swatch + text;
    })
    .join("");
}

function buildFooter(payload: TExportPayload, colors: TExportChartColors): string {
  const text = `Climatica · WorldClim · ${payload.labels.periodLabel}`;
  return `<text x="${L.paddingX}" y="${L.footerY}" font-size="11" fill="${colors.textSecondary}">${escapeXml(text)}</text>`;
}

export function buildExportSvg(payload: TExportPayload, colors: TExportChartColors): string {
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
  const monthBands = payload.monthlyData.map((_, i) =>
    monthBandX(i, plotRight - plotLeft, payload.monthlyData.length),
  );
  const shiftedBands = monthBands.map((band) => ({
    ...band,
    x: band.x + plotLeft,
    center: band.center + plotLeft,
  }));

  const body = [
    buildHeader(payload, colors),
    buildStatsTable(payload, colors),
    buildGridAndAxes(payload, colors, tempScale, precScale, plotLeft, plotRight, chartBottom),
    buildBars(payload, colors, precScale, shiftedBands, chartBottom),
    buildLine(payload, colors.tmax, "tmax", tempScale, shiftedBands),
    buildLine(payload, colors.tavg, "tavg", tempScale, shiftedBands),
    buildLine(payload, colors.tmin, "tmin", tempScale, shiftedBands),
    buildMonthLabels(payload, colors, shiftedBands, chartBottom),
    `<text x="${(plotLeft + plotRight) / 2}" y="${chartBottom + 40}" text-anchor="middle" font-size="11" font-weight="600" fill="${colors.textSecondary}">${escapeXml(payload.labels.monthAxisLabel)}</text>`,
    buildLegend(payload, colors),
    buildAridityLegend(payload, colors),
    buildFooter(payload, colors),
  ].join("\n");

  // Built as a joined array, not a single multi-line template literal — a raw
  // multi-line template is fragile here because Prettier can re-indent the
  // literal's surrounding return statement, which inserts whitespace BEFORE
  // <?xml ...?>. The XML spec requires the declaration to be the document's
  // very first character, so that whitespace breaks every consumer's parser.
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}" font-family="Inter, Roboto, Helvetica Neue, Arial, sans-serif">`,
    `<rect width="${L.width}" height="${L.height}" fill="${colors.bg}" />`,
    body,
    `</svg>`,
  ].join("\n");
}
