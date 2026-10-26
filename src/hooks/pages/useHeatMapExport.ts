import { readExportPalette } from "@/utils/export/shared/exportPalette.util";
import type {
  THeatMapExportHandlers,
  TUseHeatMapExportArgs,
} from "@/app/heat-map/_components/HeatMap.type";
import {
  gridDelta,
  pixelAnnualAvg,
  pixelSelectedAvg,
  resolveCellBounds,
} from "@/app/heat-map/_components/HeatMap.util";
import {
  HEATMAP_VALUE_DIGITS,
  STATS_LEGEND_GRADIENT_STOPS,
} from "@/app/heat-map/_components/HeatMap.constant";
import {
  DIFFERENCE_SIGN,
  EXPORT_PNG_SCALE,
  HEATMAP_EXPORT_SVG_LAYOUT,
  VARIABLE_LABELS,
} from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import type {
  THeatmapExportCell,
  THeatmapExportPayload,
  THeatmapExportSelection,
  TWorldClimBoxBinding,
} from "@/types";
import {
  buildFilename,
  buildHeatmapExportSvg,
  downloadSvgString,
  exportTableToCsv,
  getPolygonBounds,
  interpolateColor,
  resolveColorScale,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { useTranslations } from "next-intl";

/** The heat map's CSV, PNG and SVG exports — none while the region has no data. */
export function useHeatMapExport({
  selection: { bbox, polygon },
  bindings,
  stats,
  gridSize,
  activeVariable,
  colorScale,
  selectedMonths,
  periodLabel,
  statSubtitle,
  unit,
  datasetAttribution,
  shareUrl,
}: TUseHeatMapExportArgs): THeatMapExportHandlers {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const fileParts = [activeVariable, periodLabel];

  function handleExportCSV() {
    const rows = bindings
      .map((b) => {
        const lat = typeof b.lat?.value === "string" ? parseFloat(b.lat.value) : NaN;
        const lng = typeof b.lng?.value === "string" ? parseFloat(b.lng.value) : NaN;
        const value = pixelAnnualAvg(b);
        if (isNaN(lat) || isNaN(lng) || isNaN(value)) return null;
        return [lat.toFixed(4), lng.toFixed(4), value.toFixed(2)];
      })
      .filter((r): r is string[] => r !== null);
    exportTableToCsv(buildFilename("heatmap", fileParts, "csv"), ["lat", "lng", "value"], rows);
  }

  /** Colors are resolved from the live DOM, so this only ever runs inside a click handler. */
  function buildPayload(): THeatmapExportPayload | null {
    const selectionBounds = bbox ?? (polygon ? getPolygonBounds(polygon) : null);
    const exportSelection: THeatmapExportSelection | null = bbox
      ? { kind: "bbox", bounds: bbox }
      : polygon
        ? { kind: "polygon", vertices: polygon }
        : null;
    if (!selectionBounds || !exportSelection) return null;

    // * mirrors HeatmapLayer's own values and range, so the export's cells match the live map —
    // * also with a month filter, while the stats and the gradient stay annual, as on the page
    const cellSize = gridDelta(gridSize);
    const getCellValue = (b: TWorldClimBoxBinding) =>
      selectedMonths.length > 0 ? pixelSelectedAvg(b, selectedMonths) : pixelAnnualAvg(b);
    const cellValues = bindings.map(getCellValue).filter((v) => !isNaN(v));
    const cellMin = cellValues.length > 0 ? Math.min(...cellValues) : 0;
    const cellMax = cellValues.length > 0 ? Math.max(...cellValues) : 0;

    // * the light palette's colours, as every export
    const stops = readExportPalette((style) => resolveColorScale(colorScale, style));
    const cells: THeatmapExportCell[] = [];
    for (const binding of bindings) {
      const value = getCellValue(binding);
      const bounds = isNaN(value) ? null : resolveCellBounds(binding, cellSize);
      if (bounds) {
        cells.push({ bounds, color: interpolateColor(value, cellMin, cellMax, stops) });
      }
    }

    const gradientColors = Array.from({ length: STATS_LEGEND_GRADIENT_STOPS }, (_, i) =>
      interpolateColor(
        stats.min + (stats.max - stats.min) * (i / (STATS_LEGEND_GRADIENT_STOPS - 1)),
        stats.min,
        stats.max,
        stops,
      ),
    );
    const fmt = (v: number) => `${formatNumber(v, { digits: HEATMAP_VALUE_DIGITS })} ${unit}`;
    const statRow = (labelKey: string, value: string) => ({
      label: t(labelKey),
      value,
      subtitle: statSubtitle,
    });

    return {
      headerTitle: t("pages.heatMap.title"),
      headerSubtitle: `${VARIABLE_LABELS[activeVariable]} · ${statSubtitle}`,
      stats: [
        statRow("heatMap.stats.minValue", fmt(stats.min)),
        statRow("heatMap.stats.maxValue", fmt(stats.max)),
        statRow("heatMap.stats.avgValue", fmt(stats.avg)),
        statRow("heatMap.stats.median", fmt(stats.median)),
        statRow("heatMap.stats.stdDev", `${DIFFERENCE_SIGN.NONE}${fmt(stats.stdDev)}`),
        {
          label: t("heatMap.stats.cellsAnalyzed"),
          value: formatNumber(stats.count, { hasGrouping: true }),
        },
      ],
      gradientColors,
      minLabel: fmt(stats.min),
      maxLabel: fmt(stats.max),
      mapSection: { selectionBounds, cells, selection: exportSelection },
      datasetAttribution,
      shareUrl,
    };
  }

  async function handleExportPNG() {
    const payload = buildPayload();
    if (!payload) return;
    const { svg, height } = await buildHeatmapExportSvg(payload, resolveExportColors());
    await svgToPng({
      svg,
      width: HEATMAP_EXPORT_SVG_LAYOUT.width,
      height,
      scale: EXPORT_PNG_SCALE,
      filename: buildFilename("heatmap", fileParts, "png"),
    });
  }

  async function handleExportSVG() {
    const payload = buildPayload();
    if (!payload) return;
    const { svg } = await buildHeatmapExportSvg(payload, resolveExportColors());
    downloadSvgString(svg, buildFilename("heatmap", fileParts, "svg"));
  }

  return stats.count > 0
    ? { onExportCSV: handleExportCSV, onExportPNG: handleExportPNG, onExportSVG: handleExportSVG }
    : {};
}
