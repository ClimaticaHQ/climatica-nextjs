import { WALTER_LIETH_BREAKPOINT } from "@/constants";
import { useFormatNumber, useMediaQuery } from "@/hooks";
import { formatMonthLabel, getWalterLiethTempTicks } from "@/utils";
import { useLocale } from "next-intl";
import type { TUseWalterLiethAxesArgs } from "../WalterLiethChart.type";
import { getMonthAxis, getPrecTicks, getPrecTickValue } from "../WalterLiethChart.util";

/** Axis ticks and month labels — in the format the chart's own width allows. */
export function useWalterLiethAxes({ rows, domain, monthFormat: format }: TUseWalterLiethAxesArgs) {
  const locale = useLocale();
  const formatNumber = useFormatNumber();
  // * only the dot size still follows the viewport
  const isSmallScreen = useMediaQuery(WALTER_LIETH_BREAKPOINT.SMALL_SCREEN_MEDIA_QUERY);

  const formatMonthTick = (position: number) => {
    const row = rows[position];
    return row ? formatMonthLabel({ locale, monthIndex: row.monthIndex, format }) : "";
  };

  // * whole degrees and millimetres, in the locale's digits
  const formatTempTick = (value: number) => formatNumber(value);
  const formatPrecTick = (axisValue: number) => formatNumber(getPrecTickValue(axisValue));

  return {
    isSmallScreen,
    formatMonthTick,
    formatTempTick,
    formatPrecTick,
    monthAxis: getMonthAxis(rows.length),
    // * °C ticks incl. tempMax (the dashed top-of-scale line) — same rule as the export
    tempTicks: getWalterLiethTempTicks(domain),
    precTicks: getPrecTicks(domain),
  };
}
