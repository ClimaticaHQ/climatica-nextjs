import { VARIABLE_LABELS, WEATHER_VARIABLES } from "@/constants";
import type { TCsvVariable, TMonthlyTemperature, TVariable } from "@/types";
import html2canvas from "html2canvas";
import type { RefObject } from "react";

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

function html2canvasOpts(_el: HTMLElement) {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim();
  return {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    backgroundColor: bg || "#ffffff",
  };
}

/** Returns a full filename including extension: "compare-cities-rome-oslo-2024-01-15.png" */
export function buildFilename(page: string, parts: string[], ext: "png" | "csv" | "svg"): string {
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
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, buildFilename("city-climate", [cityName], "csv"));
}

export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const cards = el.querySelectorAll("[data-stat-card]");
  cards.forEach((card) => {
    (card as HTMLElement).style.lineHeight = "1.5";
    (card as HTMLElement).style.paddingBottom = "4px";
  });

  const canvas = await html2canvas(el, html2canvasOpts(el));

  cards.forEach((card) => {
    (card as HTMLElement).style.lineHeight = "";
    (card as HTMLElement).style.paddingBottom = "";
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
  });
}

export async function exportElementToPng(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, html2canvasOpts(element));
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
  });
}

export function exportTableToCsv(filename: string, headers: string[], rows: string[][]): void {
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

export function exportToSVG(chartRef: RefObject<HTMLElement | null>, filename: string): void {
  const svg =
    chartRef.current?.querySelector<SVGElement>(".recharts-wrapper svg") ??
    chartRef.current?.querySelector<SVGElement>("svg[width]");

  if (!svg) return;

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}
