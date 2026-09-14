import type { TBuildExportPayloadParams, TExportPayload, TExportVisibleSeries } from "@/types";

/** Must match TempPrecipChart.tsx's DEFAULT_VISIBLE — the pre-toggle-interaction default. */
const FALLBACK_VISIBLE_SERIES: TExportVisibleSeries = {
  tmax: true,
  tmin: true,
  tavg: false,
  prec: true,
};

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
    visibleSeries: visibleSeries ?? FALLBACK_VISIBLE_SERIES,
    monthlyData: chartDataSingle,
    summary,
    aridity,
    scales,
    rightMax: params.rightMax,
    labels: params.labels,
  };
}
