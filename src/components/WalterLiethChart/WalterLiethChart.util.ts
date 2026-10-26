import { WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TWalterLiethDomain } from "@/types";
import { fromPrecipAxisValue, getWalterLiethPrecTicks, toPrecipAxisValue } from "@/utils";

const { MONTH_EDGE_PADDING } = WALTER_LIETH_DIAGRAM;

/** Right-axis tick positions in axis units; labels come from fromPrecipAxisValue. */
export function getPrecTicks(domain: TWalterLiethDomain): number[] {
  return getWalterLiethPrecTicks(domain).map(toPrecipAxisValue);
}

/** A right-axis tick's label value: whole millimetres. */
export function getPrecTickValue(axisValue: number) {
  return Math.round(fromPrecipAxisValue(axisValue));
}

/** Month positions 0..n-1, each at the centre of its band — same layout as the export. */
export function getMonthAxis(monthCount: number) {
  const domain: [number, number] = [-MONTH_EDGE_PADDING, monthCount - 1 + MONTH_EDGE_PADDING];
  return { ticks: Array.from({ length: monthCount }, (_, i) => i), domain };
}
