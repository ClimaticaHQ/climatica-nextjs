import { VARIABLE_LABELS, WEATHER_VARIABLES } from "@/constants";
import type { TCsvVariable, TMonthlyTemperature, TVariable } from "@/types";

function isCsvVariable(v: TVariable): v is TCsvVariable {
  return (WEATHER_VARIABLES as readonly string[]).includes(v);
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Returns a full filename including extension: "compare-cities-rome-oslo-2024-01-15.png" */
export function buildFilename(
  page: string,
  parts: string[],
  ext: "png" | "csv" | "svg" | "json",
): string {
  const date = new Date().toISOString().split("T")[0];
  const slug = [page, ...parts, date]
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${slug}.${ext}`;
}

export function exportToCSV(
  data: TMonthlyTemperature[],
  cityName: string,
  variables: readonly TVariable[],
): void {
  const cols = variables.filter(isCsvVariable);
  const activeCols = cols.length > 0 ? cols : [...WEATHER_VARIABLES];
  const headers = [
    "Month",
    ...activeCols.map((v) => `${VARIABLE_LABELS[v]} (${v === "prec" ? "mm" : "°C"})`),
  ];
  const rows = [headers, ...data.map((d) => [d.monthName, ...activeCols.map((v) => String(d[v]))])];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, buildFilename("city-climate", [cityName], "csv"));
}

export function exportTableToCsv(filename: string, headers: string[], rows: string[][]): void {
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}
