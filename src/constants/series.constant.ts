import { ECompareLayout, EChartBody, ESeriesKind, ESeriesTitleSource } from "@/enums";
import type { TSeriesKindRule } from "@/types";

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

export const CHART_BODY_BY_LAYOUT = {
  [ECompareLayout.SPLIT]: EChartBody.SPLIT,
  [ECompareLayout.OVERLAY]: EChartBody.OVERLAY,
} as const satisfies Record<ECompareLayout, EChartBody>;

export const ENTITY_SHORT_LABEL = {
  CITY_CODE_LENGTH: 3,
  YEAR_PREFIX: "’",
  YEAR_DIGITS: 2,
  PERIOD_SEPARATOR: "–",
  PERIOD_YEARS: /\d{4}/g,
  NON_LETTERS: /[^\p{L}]/gu,
} as const;
