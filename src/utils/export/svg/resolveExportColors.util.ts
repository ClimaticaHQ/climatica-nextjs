import type { TExportChartColors } from "@/types";

const CSS_VAR_MAP: Record<keyof TExportChartColors, string> = {
  text: "--color-text",
  textSecondary: "--color-text-secondary",
  border: "--color-border",
  bg: "--color-bg",
  tmax: "--chart-temp-max",
  tmin: "--chart-temp-min",
  tavg: "--chart-temp-avg",
  arid: "--chart-arid",
  humid: "--chart-humid",
};

/** Resolves the live CSS custom properties to literal colors for the SVG/PNG export. */
export function resolveExportColors(): TExportChartColors {
  const computed = getComputedStyle(document.documentElement);
  const keys = Object.keys(CSS_VAR_MAP) as (keyof TExportChartColors)[];
  // Same generic-Record-construction cast as extractParams — TS can't otherwise
  // prove every key of TExportChartColors was populated by this loop.
  const entries = keys.map((key): [keyof TExportChartColors, string] => [
    key,
    computed.getPropertyValue(CSS_VAR_MAP[key]).trim(),
  ]);
  return Object.fromEntries(entries) as TExportChartColors;
}
