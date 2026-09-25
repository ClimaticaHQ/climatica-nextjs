import type { TCompareExportSeriesColors } from "@/types";

/** Raw CSS var names behind CLIMATE_COMPARISON_COLORS.A/.B (climate.constant.ts) —
 * that constant holds "var(--...)" strings meant for inline React styles, which
 * don't resolve inside a standalone SVG document (no inherited :root), so each
 * series' 4 hues are resolved to literal colors here instead, same rationale as
 * resolveExportColors() for the single-city export. */
const COMPARE_SERIES_CSS_VARS: Record<
  "A" | "B",
  Record<keyof TCompareExportSeriesColors, string>
> = {
  A: {
    tmax: "--chart-compare-a-max",
    tmin: "--chart-compare-a-min",
    tavg: "--chart-compare-a-tavg",
    prec: "--chart-compare-a-prec",
  },
  B: {
    tmax: "--chart-compare-b-max",
    tmin: "--chart-compare-b-min",
    tavg: "--chart-compare-b-tavg",
    prec: "--chart-compare-b-prec",
  },
};

export function resolveCompareSeriesColors(): Record<"A" | "B", TCompareExportSeriesColors> {
  const computed = getComputedStyle(document.documentElement);
  const resolve = (
    vars: Record<keyof TCompareExportSeriesColors, string>,
  ): TCompareExportSeriesColors => ({
    tmax: computed.getPropertyValue(vars.tmax).trim(),
    tmin: computed.getPropertyValue(vars.tmin).trim(),
    tavg: computed.getPropertyValue(vars.tavg).trim(),
    prec: computed.getPropertyValue(vars.prec).trim(),
  });

  return {
    A: resolve(COMPARE_SERIES_CSS_VARS.A),
    B: resolve(COMPARE_SERIES_CSS_VARS.B),
  };
}
