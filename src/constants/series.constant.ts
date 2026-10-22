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
  },
  [ESeriesKind.CLIMATE_PERIOD]: {
    canShade: true,
    titleSource: ESeriesTitleSource.PAGE,
    isSingleYear: false,
    hasSeriesChips: false,
    hasMeanLine: true,
  },
  [ESeriesKind.WEATHER_YEAR]: {
    canShade: false,
    titleSource: ESeriesTitleSource.PAGE,
    isSingleYear: true,
    hasSeriesChips: true,
    hasMeanLine: true,
  },
} as const satisfies Record<ESeriesKind, TSeriesKindRule>;

/** The chart body for the page's layout; a page without a layout has the single body. */
export const CHART_BODY_BY_LAYOUT = {
  [ECompareLayout.SPLIT]: EChartBody.SPLIT,
  [ECompareLayout.OVERLAY]: EChartBody.OVERLAY,
} as const satisfies Record<ECompareLayout, EChartBody>;

/**
 * An entity's short label (the values table's row headers): a weather year whole, a climate
 * period as ’70–’00, a city as its first letters, uppercase — as many as tell it apart from the
 * other cities shown, at least CITY_CODE_LENGTH.
 */
export const ENTITY_SHORT_LABEL = {
  CITY_CODE_LENGTH: 3,
  YEAR_PREFIX: "’",
  YEAR_DIGITS: 2,
  PERIOD_SEPARATOR: "–",
  // * a period's label holds its two years ("1970–2000")
  PERIOD_YEARS: /\d{4}/g,
  // * a city code counts letters only ("St. Louis" → STL)
  NON_LETTERS: /[^\p{L}]/gu,
} as const;
