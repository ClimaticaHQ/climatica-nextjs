import { MONTH_NAMES } from "@/constants";
import type { TMonthLabelFormat } from "@/types";
import { formatMonthLabel, getAxisStyle } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

/**
 * The standard chart's axes — the WL diagram's: same widths (so the same plot area), no month
 * axis title. Compact = one panel of a split pair.
 */
export function useStandardChartAxes(isCompact: boolean, monthFormat: TMonthLabelFormat) {
  const t = useTranslations();
  const locale = useLocale();
  const { tick, ...geometry } = getAxisStyle(isCompact);

  const monthIndexOf = (v: unknown) => MONTH_NAMES.findIndex((name) => name === String(v));
  const localMonthName = (v: unknown) => {
    const idx = monthIndexOf(v);
    return idx >= 0 ? t(`months.${idx + 1}`) : String(v);
  };
  const monthTick = (v: unknown) => {
    const idx = monthIndexOf(v);
    return idx >= 0
      ? formatMonthLabel({ locale, monthIndex: idx, format: monthFormat })
      : String(v);
  };

  return {
    localMonthName,
    monthTick,
    monthTickStyle: tick,
    axis: { tick, ...geometry },
  };
}
