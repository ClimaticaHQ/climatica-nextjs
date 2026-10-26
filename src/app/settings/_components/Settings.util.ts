import {
  STANDARD_CHART_LINES,
  STANDARD_CHART_SINGLE_COLORS,
} from "@/components/charts/charts.constant";
import { OVERLAY_BAR_STYLES, WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TBarStyle } from "@/types";
import { getOverlayBarFills, getOverlayBarLayout } from "@/utils";
import { getSeriesHatch } from "@/utils/seriesShape.util";
import { BAR_STYLE_PREVIEW as P } from "./Settings.constant";
import type { TBarStylePreview } from "./Settings.type";

/**
 * A bar style's thumbnail, laid out as the real overlay lays out its months (getOverlayBarLayout,
 * the style's gap): each entity's bars in its fills and hatch, by its place.
 */
export function getBarStylePreview(barStyle: TBarStyle): TBarStylePreview {
  const plotWidth = P.WIDTH - P.PLOT.LEFT - P.PLOT.RIGHT;
  const plotHeight = P.HEIGHT - P.PLOT.TOP - P.PLOT.BOTTOM;
  const bottom = P.HEIGHT - P.PLOT.BOTTOM;
  const bandWidth = plotWidth / P.MONTHS.length;
  const entityCount = P.MONTHS[0].length;
  // * the band the real chart would give a month of a year this wide
  const layout = getOverlayBarLayout({
    plotWidth: bandWidth * WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR,
    entityCount,
    gap: OVERLAY_BAR_STYLES[barStyle].gap,
    minGap: OVERLAY_BAR_STYLES[barStyle].minGap,
  });
  const centre = (monthIndex: number) => P.PLOT.LEFT + bandWidth * (monthIndex + 0.5);
  const aridityOf = (place: number) =>
    Object.fromEntries(P.MONTHS.map((bars, i) => [i + 1, bars[place]?.isArid === true]));

  const bars = P.MONTHS.flatMap((monthBars, monthIndex) =>
    monthBars.map(({ height }, place) => ({
      key: `${monthIndex}-${place}`,
      x: centre(monthIndex) + (layout.offsets[place] ?? 0) - layout.barSize / 2,
      y: bottom - height * plotHeight,
      width: layout.barSize,
      height: height * plotHeight,
      month: monthIndex + 1,
      aridityByMonth: aridityOf(place),
      fills: getOverlayBarFills(barStyle, place),
      hatch: getSeriesHatch(place),
    })),
  );
  const curves = P.CURVES.map(({ variable, points }) => {
    const xy = points.map((share, i) => ({ x: centre(i), y: P.PLOT.TOP + share * plotHeight }));
    return {
      variable,
      d: xy.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" "),
      stroke: STANDARD_CHART_SINGLE_COLORS[variable],
      dash: STANDARD_CHART_LINES.find((line) => line.variable === variable)?.dash,
      points: xy,
    };
  });
  return { bars, curves };
}
