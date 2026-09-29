import { WALTER_LIETH_COLOR_VARS } from "@/constants";
import type { TExportChartColors } from "@/types";
import { readExportPalette } from "../shared/exportPalette.util";

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
  primary: "--color-primary",
  wlTemp: WALTER_LIETH_COLOR_VARS.TEMP,
  wlPrec: WALTER_LIETH_COLOR_VARS.PREC,
  wlHumidHatch: WALTER_LIETH_COLOR_VARS.HUMID_HATCH,
  wlAridHatch: WALTER_LIETH_COLOR_VARS.ARID_HATCH,
  wlCompressedFill: WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL,
  wlFrost: WALTER_LIETH_COLOR_VARS.FROST,
  wlSeriesA: WALTER_LIETH_COLOR_VARS.SERIES_A,
  wlSeriesB: WALTER_LIETH_COLOR_VARS.SERIES_B,
};

/** Resolves the export colors from the light palette — identical in light and dark mode. */
export function resolveExportColors(): TExportChartColors {
  return readExportPalette(resolveFrom);
}

function resolveFrom(computed: CSSStyleDeclaration): TExportChartColors {
  const keys = Object.keys(CSS_VAR_MAP) as (keyof TExportChartColors)[];
  // Same generic-Record-construction cast as extractParams — TS can't otherwise
  // prove every key of TExportChartColors was populated by this loop.
  const entries = keys.map((key): [keyof TExportChartColors, string] => [
    key,
    computed.getPropertyValue(CSS_VAR_MAP[key]).trim(),
  ]);
  return Object.fromEntries(entries) as TExportChartColors;
}
