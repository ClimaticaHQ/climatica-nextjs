import type { ExportMenuProps } from "@/components/UI";
import {
  COMPARE_EXPORT_DEFAULT_VISIBLE,
  COMPARE_EXPORT_SVG_LAYOUT,
  DOCUMENT_TITLE,
  EXPORT_PNG_SCALE,
  MISSING_VALUE_LABEL,
  SERIES_KIND_RULES,
} from "@/constants";
import { ESeriesKind, ESeriesTitleSource } from "@/enums";
import { useMonthlyTableLabels } from "@/hooks/ui/useMonthlyTableLabels";
import type { TCompareExportPayload, TUseComparisonChartExportArgs } from "@/types";
import {
  buildClimateStatsRows,
  buildCompareExportSvg,
  buildFilename,
  downloadSvgString,
  exportTableToCsv,
  getExportedSeriesLabels,
  getMartonneLabelKey,
  resolveCompareSeriesColors,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { useComparisonExportBlock } from "./useComparisonExportBlock";
import { useStatsTable } from "./useStatsTable";

/**
 * The export menu for a compared pair: CSV of the stats table, PNG / SVG of the comparison as
 * shown (chart type, layout, shading, expanded panel, chips). The file is titled like the chart
 * and named after the page's place and the exported series. Disabled while data is replaced.
 */
export function useComparisonChartExport(args: TUseComparisonChartExportArgs): ExportMenuProps {
  const { model, viewState, features, fileStem, isFetching } = args;
  const t = useTranslations();
  const locale = useLocale();
  const tableLabels = useMonthlyTableLabels();
  const table = useStatsTable(model, features);
  const visible = args.visible ?? COMPARE_EXPORT_DEFAULT_VISIBLE;
  const comparison = useComparisonExportBlock({ model, viewState, table, visible });

  const [first, second] = model.series;
  const rule = SERIES_KIND_RULES[first?.series.kind ?? ESeriesKind.CITY];
  const labels = model.series.map(({ series }) => series.label);
  const [labelA = "", labelB = ""] = labels;
  // * the chart's title: the series' names, or the page's place they all belong to
  const pageNames = rule.titleSource === ESeriesTitleSource.PAGE ? features.title.names : [];
  const titleNames = rule.titleSource === ESeriesTitleSource.PAGE ? pageNames : labels;
  const statsLabels = [
    t("climateComparison.stats.avgTmax"),
    t("climateComparison.stats.avgTmin"),
    t("climateComparison.stats.totalPrec"),
    t("climateComparison.stats.aridMonths"),
  ];
  const martonneClass = (index: number | null) =>
    index !== null ? t(getMartonneLabelKey(index)) : null;

  /** Colours come from the live DOM: build only inside a click, never while rendering. */
  function buildPayload(): TCompareExportPayload | null {
    if (!first || !second || !model.scales) return null;
    const colors = resolveCompareSeriesColors();
    return {
      headerTitle: titleNames.join(DOCUMENT_TITLE.PLACES_SEPARATOR),
      headerSubtitle: features.title.subtitle ?? "",
      series: [first, second].map((entry, index) => ({
        label: entry.series.label,
        data: entry.chartData,
        stats: entry.stats,
        altitude: entry.series.altitude,
        martonneClassLabel: martonneClass(entry.stats.martonneIndex),
        colors: index === 0 ? colors.A : colors.B,
      })),
      visibleSeries: visible,
      selectedMonths: viewState.selectedMonths,
      scales: model.scales,
      rightMax: model.rightMax,
      labels: {
        locale,
        monthNames: Array.from({ length: 12 }, (_, i) => t(`months.${i + 1}`)),
        tableLabels,
        seriesLabels: {
          tmax: t("chart.maxTemperature"),
          tmin: t("chart.minTemperature"),
          tavg: t("chart.avgTemperature"),
          prec: t("chart.precipitation"),
        },
        statsLabels: {
          avgTmax: statsLabels[0] ?? "",
          avgTmin: statsLabels[1] ?? "",
          totalPrec: statsLabels[2] ?? "",
          aridMonths: statsLabels[3] ?? "",
          altitude: t("chart.altitude"),
          martonne: t("chart.martonne"),
        },
      },
      showTavgLine: rule.hasMeanLine,
      datasetAttribution: args.datasetAttribution,
      shareUrl: args.shareUrl,
      ...(comparison ? { comparison } : {}),
    };
  }

  // * PNG / SVG show the expanded panel alone — the file name says which series
  const exportedLabels = getExportedSeriesLabels({
    expanded: comparison?.expanded ?? null,
    labelA,
    labelB,
  });
  const imageName = (extension: "png" | "svg") =>
    buildFilename(fileStem, [...pageNames, ...exportedLabels], extension);

  function exportCsv() {
    if (!first?.hasData || !second?.hasData) return;
    const altitudes = [first.series.altitude, second.series.altitude];
    const rows = buildClimateStatsRows([first.stats, second.stats], statsLabels);
    if (altitudes.some((altitude) => altitude !== null)) {
      rows.push([
        t("chart.altitude"),
        ...altitudes.map((altitude) => (altitude !== null ? `${altitude} m` : MISSING_VALUE_LABEL)),
      ]);
    }
    rows.push([
      t("chart.martonne"),
      ...[first.stats, second.stats].map(({ martonneIndex }) =>
        martonneIndex !== null
          ? `${martonneIndex.toFixed(1)} (${martonneClass(martonneIndex)})`
          : MISSING_VALUE_LABEL,
      ),
    ]);
    exportTableToCsv(
      buildFilename(fileStem, [...pageNames, labelA, labelB], "csv"),
      [t("exportMenu.metricColumn"), labelA, labelB],
      rows,
    );
  }

  return {
    onExportCSV: exportCsv,
    onExportPNG: async () => {
      const payload = buildPayload();
      if (!payload) return;
      const { svg, height } = buildCompareExportSvg(payload, resolveExportColors());
      await svgToPng({
        svg,
        width: COMPARE_EXPORT_SVG_LAYOUT.width,
        height,
        scale: EXPORT_PNG_SCALE,
        filename: imageName("png"),
      });
    },
    onExportSVG: () => {
      const payload = buildPayload();
      if (!payload) return;
      downloadSvgString(
        buildCompareExportSvg(payload, resolveExportColors()).svg,
        imageName("svg"),
      );
    },
    // * a refetch in progress: exporting now would save the data being replaced
    isDisabled: isFetching,
    ...(isFetching ? { disabledReason: t("exportMenu.updating") } : {}),
  };
}
