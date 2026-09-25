import { HEATMAP_EXPORT_SVG_LAYOUT as L } from "@/constants";
import type {
  TExportChartColors,
  TFooterTextLine,
  THeatmapExportPayload,
  TSvgExportResult,
} from "@/types";
import { buildFooterTextLines } from "../shared/footerLines.util";
import { escapeXml } from "./buildExportSvg.util";
import { buildHeatmapMapSection } from "./buildHeatmapMapSection.util";

function buildHeader(payload: THeatmapExportPayload, colors: TExportChartColors): string {
  return `
    <text x="${L.paddingX}" y="${L.headerTitleY}" font-size="24" font-weight="700" fill="${colors.text}">${escapeXml(payload.headerTitle)}</text>
    <text x="${L.paddingX}" y="${L.headerSubtitleY}" font-size="${L.headerSubtitleFontSize}" fill="${colors.textSecondary}">${escapeXml(payload.headerSubtitle)}</text>
    <line x1="${L.paddingX}" y1="${L.headerRuleY}" x2="${L.width - L.paddingX}" y2="${L.headerRuleY}" stroke="${colors.border}" stroke-width="1" />
  `;
}

/** One bordered row of stat blocks — the export counterpart to StatsLegendBar.tsx's
 * min/max/avg/median/stdDev/cells grid. */
function buildStatsRow(payload: THeatmapExportPayload, colors: TExportChartColors): string {
  const tableWidth = L.width - L.paddingX * 2;
  const colWidth = tableWidth / payload.stats.length;

  const border = `<rect x="${L.paddingX}" y="${L.statsY}" width="${tableWidth}" height="${L.statsHeight}" fill="none" stroke="${colors.border}" stroke-width="1" />`;
  const dividers = payload.stats
    .slice(1)
    .map((_, i) => {
      const x = L.paddingX + colWidth * (i + 1);
      return `<line x1="${x}" y1="${L.statsY}" x2="${x}" y2="${L.statsY + L.statsHeight}" stroke="${colors.border}" stroke-width="1" />`;
    })
    .join("");

  const content = payload.stats
    .map((stat, i) => {
      const cx = L.paddingX + colWidth * i + colWidth / 2;
      const subtitle = stat.subtitle
        ? `<text x="${cx}" y="${L.statsY + 58}" text-anchor="middle" font-size="10" fill="${colors.textSecondary}" opacity="0.7">${escapeXml(stat.subtitle)}</text>`
        : "";
      return `
        <text x="${cx}" y="${L.statsY + 20}" text-anchor="middle" font-size="11" fill="${colors.textSecondary}">${escapeXml(stat.label)}</text>
        <text x="${cx}" y="${L.statsY + 42}" text-anchor="middle" font-size="16" font-weight="600" fill="${colors.text}">${escapeXml(stat.value)}</text>
        ${subtitle}
      `;
    })
    .join("");

  return border + dividers + content;
}

function buildGradientLegend(payload: THeatmapExportPayload, colors: TExportChartColors): string {
  const gradientId = "heatmap-export-gradient";
  const barWidth = L.width - L.paddingX * 2;
  const stops = payload.gradientColors
    .map((color, i) => {
      const offset =
        payload.gradientColors.length > 1 ? (i / (payload.gradientColors.length - 1)) * 100 : 0;
      return `<stop offset="${offset}%" stop-color="${color}" />`;
    })
    .join("");
  const labelY = L.gradientY + L.gradientHeight + 16;

  return `
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient>
    </defs>
    <rect x="${L.paddingX}" y="${L.gradientY}" width="${barWidth}" height="${L.gradientHeight}" fill="url(#${gradientId})" rx="3" />
    <text x="${L.paddingX}" y="${labelY}" font-size="11" fill="${colors.textSecondary}">${escapeXml(payload.minLabel)}</text>
    <text x="${L.width - L.paddingX}" y="${labelY}" text-anchor="end" font-size="11" fill="${colors.textSecondary}">${escapeXml(payload.maxLabel)}</text>
  `;
}

function renderFooterLines(lines: TFooterTextLine[], colors: TExportChartColors): string {
  return lines
    .map(({ text, fontSize }, i) => {
      const y = L.footerY + i * L.footerLineHeight;
      return `<text x="${L.paddingX}" y="${y}" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(text)}</text>`;
    })
    .join("\n");
}

export async function buildHeatmapExportSvg(
  payload: THeatmapExportPayload,
  colors: TExportChartColors,
): Promise<TSvgExportResult> {
  const footerLines = buildFooterTextLines({
    contextLabel: payload.headerSubtitle,
    datasetAttribution: payload.datasetAttribution,
    shareUrl: payload.shareUrl,
    layout: L,
  });
  const height = L.footerY + footerLines.length * L.footerLineHeight + L.footerBottomMargin;
  const mapSection = await buildHeatmapMapSection(payload.mapSection, colors);

  const body = [
    buildHeader(payload, colors),
    buildStatsRow(payload, colors),
    mapSection,
    buildGradientLegend(payload, colors),
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
