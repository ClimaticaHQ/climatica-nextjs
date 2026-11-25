import { ChartDeviceContext } from "@/components/charts/chartDevice.context";
import { MONTH_NAMES } from "@/constants";
import type { TMonthLabelFormat } from "@/types";
import { formatMonthLabel, getAxisStyle } from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { useContext } from "react";

export function useStandardChartAxes(
  isCompact: boolean,
  monthFormat: TMonthLabelFormat,
  isNarrow = false,
) {
  const t = useTranslations();
  const locale = useLocale();
  const { textScale } = useContext(ChartDeviceContext);
  const { tick, ...geometry } = getAxisStyle({ isCompact, isNarrow, textScale });

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
