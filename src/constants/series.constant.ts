import { ECompareLayout, EChartBody, ESeriesKind, ESeriesTitleSource } from "@/enums";
import type { TSeriesKindRule } from "@/types";

/**
 * The rules inherent to each series kind. The chart card decides from these and the page's
 * features — never from the page or the number of series.
 */
export const SERIES_KIND_RULES = {
  [ESeriesKind.CITY]: {
    canShade: true,
    titleSource: ESeriesTitleSource.SERIES_LABELS,
    isSingleYear: false,
    hasSeriesChips: false,
    hasMeanLine: true,
    usesOwnColor: false,
  },
  [ESeriesKind.CLIMATE_PERIOD]: {
    canShade: true,
    titleSource: ESeriesTitleSource.PAGE,
    isSingleYear: false,
    hasSeriesChips: false,
    hasMeanLine: true,
    usesOwnColor: false,
  },
  [ESeriesKind.WEATHER_YEAR]: {
    canShade: false,
    titleSource: ESeriesTitleSource.PAGE,
    isSingleYear: true,
    hasSeriesChips: true,
    // * years are compared by max / min
    hasMeanLine: false,
    usesOwnColor: true,
  },
} as const satisfies Record<ESeriesKind, TSeriesKindRule>;

/** The chart body for the page's layout; a page without a layout has the single body. */
export const CHART_BODY_BY_LAYOUT = {
  [ECompareLayout.SPLIT]: EChartBody.SPLIT,
  [ECompareLayout.OVERLAY]: EChartBody.OVERLAY,
} as const satisfies Record<ECompareLayout, EChartBody>;
