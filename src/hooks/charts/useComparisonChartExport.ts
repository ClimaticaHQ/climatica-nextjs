import type { ExportMenuProps } from "@/components/UI";
import {
  COMPARE_EXPORT_DEFAULT_VISIBLE,
  COMPARE_EXPORT_SVG_LAYOUT,
  DOCUMENT_TITLE,
  EXPORT_BAR_STYLE,
  EXPORT_PNG_SCALE,
  MISSING_VALUE_LABEL,
  SERIES_KIND_RULES,
} from "@/constants";
import { ECompareLayout, ESeriesKind, ESeriesTitleSource } from "@/enums";
import { useMonthlyTableLabels } from "@/hooks/ui/useMonthlyTableLabels";
import type { TCompareExportPayload, TUseComparisonChartExportArgs } from "@/types";
import {
  buildClimateStatsRows,
  buildCompareExportSvg,
  buildFilename,
  downloadSvgString,
  exportTableToCsv,
  getDrawnSeries,
  getEntityShortLabels,
  getExportedSeriesLabels,
  getMartonneLabelKey,
  getSplitPair,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { useComparisonExportBlock } from "./useComparisonExportBlock";
import { useComparisonTable } from "./useComparisonTable";
import { useYearsExportBlock } from "./useYearsExportBlock";

/**
 * The export menu for compared series — a pair or the weather years: CSV of their stats, PNG /
 * SVG of the chart as shown (chart type, layout, shading, expanded panel or drawn years, chips).
 * The file is titled like the chart and named after the page's place and the exported series;
 * its overlay's bars are always the default bar style (EXPORT_BAR_STYLE), whatever the setting.
 * Disabled while data is replaced.
 */
export function useComparisonChartExport(args: TUseComparisonChartExportArgs): ExportMenuProps {
  const { model, viewState, features, fileStem, isFetching } = args;
  const t = useTranslations();
  const locale = useLocale();
  const tableLabels = useMonthlyTableLabels();
  const table = useComparisonTable(model, features);
  const visible = args.visible ?? COMPARE_EXPORT_DEFAULT_VISIBLE;
  const comparison = useComparisonExportBlock({ model, viewState, table, visible });

  const rule = SERIES_KIND_RULES[model.series[0]?.series.kind ?? ESeriesKind.CITY];
  const isSplit = viewState.layout?.value === ECompareLayout.SPLIT;
  const drawn = isSplit
    ? (getSplitPair(model, viewState)?.entries ?? [])
    : getDrawnSeries(model, viewState);
  const years = useYearsExportBlock({
    model,
    viewState,
    drawn: drawn.flatMap(({ series }) => (series.year !== null ? [series.year] : [])),
  });

  const labels = model.series.map(({ series }) => series.label);
  const [labelA = "", labelB = ""] = labels;
  // * the chart's title: the series' names, or the page's place they all belong to
  const pageNames = rule.titleSource === ESeriesTitleSource.PAGE ? features.title.names : [];
  const titleNames = rule.titleSource === ESeriesTitleSource.PAGE ? pageNames : labels;
  // * PNG / SVG show the expanded panel, or the drawn years — the file name says which
  const exportedLabels = comparison
    ? getExportedSeriesLabels({ expanded: comparison.expanded, labelA, labelB })
    : drawn.map(({ series }) => series.label);
  const statsLabels = {
    avgTmax: t("climateComparison.stats.avgTmax"),
    avgTmin: t("climateComparison.stats.avgTmin"),
    totalPrec: t("climateComparison.stats.totalPrec"),
    aridMonths: t("climateComparison.stats.aridMonths"),
  };
  const martonneClass = (index: number | null) =>
    index !== null ? t(getMartonneLabelKey(index)) : null;

  /** Built only inside a click, never while rendering. */
  function buildPayload(): TCompareExportPayload | null {
    const loaded = model.series.filter(({ hasData }) => hasData);
    if (loaded.length === 0 || !model.scales) return null;
    const shortLabels = getEntityShortLabels(loaded.map(({ series }) => series));
    return {
      headerTitle: titleNames.join(DOCUMENT_TITLE.PLACES_SEPARATOR),
      headerSubtitle: features.title.subtitle ?? "",
      series: loaded.map((entry, index) => ({
        label: entry.series.label,
        shortLabel: shortLabels[index] ?? entry.series.label,
        data: entry.chartData,
        stats: entry.stats,
        altitude: entry.series.altitude,
        martonneClassLabel: martonneClass(entry.stats.martonneIndex),
        shape: entry.series.shape,
        hatch: entry.series.hatch,
        place: model.series.indexOf(entry),
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
        aridityLegend: { humid: t("chart.humidPeriod"), arid: t("chart.aridPeriod") },
        statsLabels: {
          ...statsLabels,
          altitude: t("chart.altitude"),
          // * a weather year's index describes that year alone
          martonne: rule.isSingleYear ? t("chart.martonnePerYear") : t("chart.martonne"),
        },
      },
      showTavgLine: rule.hasMeanLine,
      barStyle: EXPORT_BAR_STYLE,
      datasetAttribution: args.datasetAttribution,
      shareUrl: args.shareUrl,
      ...(comparison ? { comparison } : {}),
      ...(!comparison && rule.isSingleYear && years ? { weatherYears: years } : {}),
    };
  }

  const imageName = (extension: "png" | "svg") =>
    buildFilename(fileStem, [...pageNames, ...exportedLabels], extension);

  function exportCsv() {
    const stats = model.series.map((entry) => (entry.hasData ? entry.stats : undefined));
    const altitudes = model.series.map(({ series }) => series.altitude);
    const rows = buildClimateStatsRows(stats, Object.values(statsLabels));
    if (altitudes.some((altitude) => altitude !== null)) {
      rows.push([
        t("chart.altitude"),
        ...altitudes.map((altitude) => (altitude !== null ? `${altitude} m` : MISSING_VALUE_LABEL)),
      ]);
    }
    rows.push([
      t("chart.martonne"),
      ...stats.map((entry) => {
        const index = entry?.martonneIndex ?? null;
        if (index === null) return MISSING_VALUE_LABEL;
        // * a weather year's column gives the index alone
        return rule.isSingleYear
          ? index.toFixed(1)
          : `${index.toFixed(1)} (${martonneClass(index)})`;
      }),
    ]);
    exportTableToCsv(
      buildFilename(fileStem, [...pageNames, ...labels], "csv"),
      [t("exportMenu.metricColumn"), ...labels],
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
