import { WALTER_LIETH_COLOR_VARS } from "@/constants";
import type { TExportChartColors } from "@/types";
import { readExportPalette } from "../shared/exportPalette.util";

const CSS_VAR_MAP: Record<keyof TExportChartColors, string> = {
  text: "--color-text",
  textSecondary: "--color-text-secondary",
  border: "--color-border",
  bg: "--color-surface",
  tmax: "--color-chart-temp-max",
  tmin: "--color-chart-temp-min",
  tavg: "--color-chart-temp-avg",
  arid: "--color-chart-arid",
  humid: "--color-chart-humid",
  brand: "--color-brand",
  wlTemp: WALTER_LIETH_COLOR_VARS.TEMP,
  wlPrec: WALTER_LIETH_COLOR_VARS.PREC,
  wlHumidHatch: WALTER_LIETH_COLOR_VARS.HUMID_HATCH,
  wlAridHatch: WALTER_LIETH_COLOR_VARS.ARID_HATCH,
  wlCompressedFill: WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL,
  wlFrost: WALTER_LIETH_COLOR_VARS.FROST,
  wlFrostOutline: WALTER_LIETH_COLOR_VARS.FROST_OUTLINE,
  seriesMarker: "--color-series-marker",
};

export function resolveExportColors(): TExportChartColors {
  return readExportPalette(resolveFrom);
}

function resolveFrom(computed: CSSStyleDeclaration): TExportChartColors {
  const keys = Object.keys(CSS_VAR_MAP) as (keyof TExportChartColors)[];
  // a cast at the boundary: TS can't prove the loop sets every key
  const entries = keys.map((key): [keyof TExportChartColors, string] => [
    key,
    computed.getPropertyValue(CSS_VAR_MAP[key]).trim(),
  ]);
  return Object.fromEntries(entries) as TExportChartColors;
}
