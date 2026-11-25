import { WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TWalterLiethDomain } from "@/types";
import { getWalterLiethPrecTicks, toPrecipAxisValue } from "@/utils";

const { MONTH_EDGE_PADDING } = WALTER_LIETH_DIAGRAM;

export function getPrecTicks(domain: TWalterLiethDomain): number[] {
  return getWalterLiethPrecTicks(domain).map(toPrecipAxisValue);
}

export function getMonthAxis(monthCount: number) {
  const domain: [number, number] = [-MONTH_EDGE_PADDING, monthCount - 1 + MONTH_EDGE_PADDING];
  return { ticks: Array.from({ length: monthCount }, (_, i) => i), domain };
}
