import { VARIABLE_LABELS, WEATHER_VARIABLES } from "@/constants";
import type { TCsvVariable, TMonthlyTemperature, TVariable } from "@/types";
import domtoimage from "dom-to-image-more";
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

async function forceLayoutSettle(el: HTMLElement): Promise<void> {
  el.getBoundingClientRect();
  await new Promise<void>((r) =>
    requestAnimationFrame(() => {
      requestAnimationFrame(() => r());
    }),
  );
}

function pinComputedLineHeights(el: HTMLElement): Map<HTMLElement, string> {
  const originals = new Map<HTMLElement, string>();
  [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))].forEach((node) => {
    const lh = getComputedStyle(node).lineHeight;
    originals.set(node, node.style.lineHeight);
    node.style.lineHeight = lh;
  });
  return originals;
}

function restoreLineHeights(originals: Map<HTMLElement, string>): void {
  originals.forEach((lh, node) => {
    node.style.lineHeight = lh;
  });
}

function resolveCssVars(cloneEl: SVGElement, sourceEl: SVGElement): void {
  const sourceChildren = sourceEl.querySelectorAll("*");
  const cloneChildren = cloneEl.querySelectorAll("*");

  [sourceEl, ...Array.from(sourceChildren)].forEach((src, i) => {
    const cloneTarget = i === 0 ? cloneEl : (cloneChildren[i - 1] as SVGElement);
    const computed = getComputedStyle(src);
    const inlineStyle: Record<string, string> = {};

    ["fill", "stroke", "color", "font-family", "font-size", "font-weight"].forEach((prop) => {
      const val = computed.getPropertyValue(prop).trim();
      if (val && val !== "none" && !val.startsWith("var(")) {
        inlineStyle[prop] = val;
      }
    });

    Object.entries(inlineStyle).forEach(([k, v]) => {
      cloneTarget.style.setProperty(k, v);
    });
  });
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
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, buildFilename("city-climate", [cityName], "csv"));
}

async function lockWidth(el: HTMLElement): Promise<() => void> {
  const rect = el.getBoundingClientRect();
  const originalWidth = el.style.width;
  const originalBoxSizing = el.style.boxSizing;

  el.style.boxSizing = "border-box";
  el.style.width = `${rect.width}px`;

  return () => {
    el.style.width = originalWidth;
    el.style.boxSizing = originalBoxSizing;
  };
}

async function waitForFonts(): Promise<void> {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
}

export async function exportToPNG(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  await waitForFonts();
  await forceLayoutSettle(el);

  const unlockWidth = await lockWidth(el);

  const cards = el.querySelectorAll("[data-stat-card]");
  cards.forEach((card) => {
    (card as HTMLElement).style.lineHeight = "1.5";
    (card as HTMLElement).style.paddingBottom = "4px";
  });

  const lineHeights = pinComputedLineHeights(el);

  await forceLayoutSettle(el);

  const rect = el.getBoundingClientRect();
  const resolvedBg =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#ffffff";

  const dataUrl = await domtoimage.toPng(el, {
    scale: 2,
    bgcolor: resolvedBg,
    width: rect.width,
    height: rect.height,
    style: {
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    },
  });

  restoreLineHeights(lineHeights);
  cards.forEach((card) => {
    (card as HTMLElement).style.lineHeight = "";
    (card as HTMLElement).style.paddingBottom = "";
  });
  unlockWidth();

  triggerDownload(dataUrl, filename);
}

export async function exportElementToPng(element: HTMLElement, filename: string): Promise<void> {
  await forceLayoutSettle(element);

  const lineHeights = pinComputedLineHeights(element);

  const resolvedBg =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#ffffff";

  const dataUrl = await domtoimage.toPng(element, { scale: 2, bgcolor: resolvedBg });

  restoreLineHeights(lineHeights);
  triggerDownload(dataUrl, filename);
}

export function exportTableToCsv(filename: string, headers: string[], rows: string[][]): void {
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}

export function exportToSVG(chartRef: RefObject<HTMLElement | null>, filename: string): void {
  const root = chartRef.current;
  const svg =
    root?.querySelector<SVGElement>(".recharts-wrapper > svg") ??
    root?.querySelector<SVGElement>("svg:not([aria-label])") ??
    root?.querySelector<SVGElement>("svg");

  if (!svg) return;

  const { width, height } = svg.getBoundingClientRect();
  const hasViewBox = svg.hasAttribute("viewBox");
  if (!hasViewBox && width <= 100) {
    console.warn("exportToSVG: selected SVG appears to be an icon, aborting export");
    return;
  }
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  resolveCssVars(clone, svg);

  const resolvedBg =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#ffffff";

  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("width", "100%");
  bgRect.setAttribute("height", "100%");
  bgRect.setAttribute("fill", resolvedBg);
  clone.insertBefore(bgRect, clone.firstChild);

  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${serialized}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
}
