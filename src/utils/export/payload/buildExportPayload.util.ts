import { DEFAULT_VISIBLE_SERIES } from "@/components/TempPrecipChart/TempPrecipChart.constant";
import type { TBuildExportPayloadParams, TExportPayload } from "@/types";

export function buildExportPayload(params: TBuildExportPayloadParams): TExportPayload | null {
  const { chartDataSingle, aridity, scales, summary, visibleSeries } = params;

  if (chartDataSingle.length === 0 || !aridity || !scales || !summary) {
    return null;
  }

  return {
    location: {
      cityName: params.cityName,
      lat: params.lat,
      lng: params.lng,
      altitude: params.altitude,
    },
    gridSize: params.gridSize,
    subtitle: params.subtitle,
    variables: params.variables,
    selectedMonths: params.selectedMonths,
    visibleSeries: visibleSeries ?? DEFAULT_VISIBLE_SERIES,
    monthlyData: chartDataSingle,
    summary,
    aridity,
    scales,
    rightMax: params.rightMax,
    chartMode: params.chartMode,
    labels: params.labels,
    shareUrl: params.shareUrl,
    datasetAttribution: params.datasetAttribution,
  };
}
