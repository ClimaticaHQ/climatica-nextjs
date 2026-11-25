import { WALTER_LIETH_BREAKPOINT } from "@/constants";
import { EDisplayMetric } from "@/enums";
import { useDisplayFormat, useMediaQuery } from "@/hooks";
import { formatMonthLabel, fromPrecipAxisValue, getWalterLiethTempTicks } from "@/utils";
import { useLocale } from "next-intl";
import type { TUseWalterLiethAxesArgs } from "../WalterLiethChart.type";
import { getMonthAxis, getPrecTicks } from "../WalterLiethChart.util";

export function useWalterLiethAxes({ rows, domain, monthFormat: format }: TUseWalterLiethAxesArgs) {
  const locale = useLocale();
  const { formatValue } = useDisplayFormat();
  const tick = { metric: EDisplayMetric.AXIS_TICK };
  const isSmallScreen = useMediaQuery(WALTER_LIETH_BREAKPOINT.SMALL_SCREEN_MEDIA_QUERY);

  const formatMonthTick = (position: number) => {
    const row = rows[position];
    return row ? formatMonthLabel({ locale, monthIndex: row.monthIndex, format }) : "";
  };

  const formatTempTick = (value: number) => formatValue(value, tick);
  const formatPrecTick = (axisValue: number) => formatValue(fromPrecipAxisValue(axisValue), tick);

  return {
    isSmallScreen,
    formatMonthTick,
    formatTempTick,
    formatPrecTick,
    monthAxis: getMonthAxis(rows.length),
    tempTicks: getWalterLiethTempTicks(domain),
    precTicks: getPrecTicks(domain),
  };
}
