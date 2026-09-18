import type { TExportPayloadWithRawData, TRawJsonExport } from "@/types";
import { buildFilename } from "@/utils/export.util";
import { triggerDownload } from "../shared/download.util";

/** Full SCRAPI response (all variables) for downstream analysis — not just the
 * currently-toggled ones exportToCSV (export.util.ts) writes for the on-screen chart. */
export function exportRawJson(payload: TExportPayloadWithRawData): void {
  const { rawData, location, gridSize, subtitle } = payload;

  const exportObject: TRawJsonExport = {
    city: location.cityName,
    coordinates: { lat: location.lat, lng: location.lng },
    altitude: location.altitude,
    gridSize,
    dataset: subtitle.dataset ?? null,
    climatePeriod: subtitle.climatePeriod ?? null,
    weatherYear: subtitle.weatherYear ?? null,
    variables: rawData.variables,
    monthly: rawData.rows,
  };

  const json = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  triggerDownload(
    URL.createObjectURL(blob),
    buildFilename("city-climate-full", [location.cityName], "json"),
  );
}
