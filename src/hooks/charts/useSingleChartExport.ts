import type { ExportMenuProps } from "@/components/UI";
import { EXPORT_PNG_SCALE, EXPORT_SVG_LAYOUT } from "@/constants";
import { useFetchFullClimateData } from "@/hooks/data/useFetchFullClimateData";
import type { TUseSingleChartExportArgs } from "@/types";
import {
  buildExportPayload,
  buildExportSvg,
  buildFilename,
  downloadSvgString,
  exportRawCsv,
  exportRawJson,
  exportToCSV,
  isFullVariableDataAvailable,
  resolveExportColors,
  svgToPng,
} from "@/utils";
import { useTranslations } from "next-intl";
import { useSingleExportLabels } from "./useSingleExportLabels";

/**
 * The export menu for a single-series chart: CSV of the monthly values, PNG / SVG of the chart
 * as shown (chart type, chips, month filter), and — where the page offers it and the data has
 * every variable — the raw CSV / JSON. Disabled, saying why, while data is replaced or a month
 * is missing.
 */
export function useSingleChartExport(args: TUseSingleChartExportArgs): ExportMenuProps {
  const { model, viewState, features, place, subtitle, isFetching } = args;
  const t = useTranslations();
  const [entry] = model.series;
  const labels = useSingleExportLabels({
    subtitle,
    periodLabel: args.periodLabel,
    placeName: place.name,
    martonne: entry?.summary?.martonne ?? null,
  });
  const { mutateAsync: fetchFullClimateData } = useFetchFullClimateData();

  const data = entry?.series.data ?? [];
  const isRawAvailable =
    features.hasRawExport && isFullVariableDataAvailable(subtitle.dataset, subtitle.climatePeriod);
  // * Walter-Lieth plots every month, so its export does too
  const selectedMonths = viewState.mode === "walter-lieth" ? null : viewState.selectedMonths;
  const payload = entry
    ? buildExportPayload({
        cityName: place.name,
        lat: place.lat,
        lng: place.lng,
        altitude: entry.series.altitude,
        gridSize: args.gridSize,
        subtitle,
        variables: viewState.variables,
        selectedMonths,
        visibleSeries: args.visible,
        chartDataSingle: entry.chartData,
        aridity: entry.aridity,
        scales: model.scales,
        summary: entry.summary,
        rightMax: model.rightMax,
        chartMode: viewState.mode,
        labels,
        datasetAttribution: args.datasetAttribution,
        shareUrl: args.shareUrl,
      })
    : null;
  // * the export needs every month (its stats table, the Walter-Lieth diagram)
  const hasIncompleteMonths = entry !== undefined && entry.chartData.length > 0 && !entry.summary;
  const disabledReason = isFetching
    ? t("exportMenu.updating")
    : hasIncompleteMonths
      ? t("exportMenu.incompleteData")
      : undefined;
  const fileName = (extension: "png" | "svg") =>
    buildFilename(args.fileStem, [place.name], extension);

  async function fetchRawData() {
    const { climatePeriod } = subtitle;
    if (!isRawAvailable || climatePeriod === undefined) return null;
    return fetchFullClimateData({
      lat: place.lat,
      lng: place.lng,
      gridSize: args.gridSize,
      climatePeriod,
    });
  }

  return {
    onExportCSV: () => {
      if (data.length > 0) exportToCSV([...data], place.name, viewState.variables);
    },
    onExportPNG: async () => {
      if (!payload) return;
      const { svg, height } = buildExportSvg(payload, resolveExportColors());
      await svgToPng({
        svg,
        width: EXPORT_SVG_LAYOUT.width,
        height,
        scale: EXPORT_PNG_SCALE,
        filename: fileName("png"),
      });
    },
    onExportSVG: () => {
      if (!payload) return;
      downloadSvgString(buildExportSvg(payload, resolveExportColors()).svg, fileName("svg"));
    },
    ...(features.hasRawExport
      ? {
          onExportRawCsv: async () => {
            const rawData = payload ? await fetchRawData() : null;
            if (payload && rawData) exportRawCsv({ ...payload, rawData });
          },
          onExportRawJson: async () => {
            const rawData = payload ? await fetchRawData() : null;
            if (payload && rawData) exportRawJson({ ...payload, rawData });
          },
          isRawDataAvailable: isRawAvailable,
        }
      : {}),
    isDisabled: data.length === 0 || disabledReason !== undefined,
    ...(disabledReason !== undefined ? { disabledReason } : {}),
  };
}
