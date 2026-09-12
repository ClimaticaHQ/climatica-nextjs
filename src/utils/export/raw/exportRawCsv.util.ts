import { VARIABLE_LABELS, VARIABLE_UNITS } from "@/constants";
import type { TExportPayloadWithRawData } from "@/types";
import { buildFilename } from "@/utils/export.util";
import { triggerDownload } from "../shared/download.util";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Full SCRAPI response (all variables) for downstream analysis — not just the
 * currently-toggled ones exportToCSV (export.util.ts) writes for the on-screen chart. */
export function exportRawCsv(payload: TExportPayloadWithRawData): void {
  const { rawData, location, gridSize, subtitle } = payload;

  const metaRows: [string, string][] = [
    ["City", location.cityName],
    ["Latitude", String(location.lat)],
    ["Longitude", String(location.lng)],
    ["Altitude (m)", location.altitude !== null ? String(location.altitude) : ""],
    ["Grid resolution", gridSize],
    ["Dataset", subtitle.dataset ?? ""],
    ["Climate period", subtitle.climatePeriod ?? ""],
    ["Weather year", subtitle.weatherYear !== undefined ? String(subtitle.weatherYear) : ""],
  ];

  const headers = [
    "Month",
    ...rawData.variables.map((v) => `${VARIABLE_LABELS[v]} (${VARIABLE_UNITS[v]})`),
  ];
  const dataRows = rawData.rows.map((row) => [
    row.monthName,
    ...rawData.variables.map((v) => (row[v] !== undefined ? String(row[v]) : "")),
  ]);

  const metaLines = metaRows.map((r) => r.map(csvEscape).join(","));
  const tableLines = [headers, ...dataRows].map((r) => r.map(csvEscape).join(","));
  const csv = [...metaLines, "", ...tableLines].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(
    URL.createObjectURL(blob),
    buildFilename("city-climate-full", [location.cityName], "csv"),
  );
}
