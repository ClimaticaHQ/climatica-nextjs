import { EDisplayMetric } from "@/enums";
import type { TDisplayPrecision, TSeriesKey } from "@/types";

export const MISSING_VALUE_LABEL = "—";

export const DIFFERENCE_SIGN = { PLUS: "+", MINUS: "\u2212", NONE: "\u00b1" } as const;

// * the one place display rounding is defined: a difference is the difference of the rounded values
export const DISPLAY_PRECISION: Record<EDisplayMetric, TDisplayPrecision> = {
  [EDisplayMetric.TEMPERATURE]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.PRECIPITATION]: { digits: 0, hasGrouping: false },
  [EDisplayMetric.ELEVATION]: { digits: 0, hasGrouping: false },
  [EDisplayMetric.MARTONNE]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.MONTH_COUNT]: { digits: 0, hasGrouping: false },
  [EDisplayMetric.CELL_COUNT]: { digits: 0, hasGrouping: true },
  [EDisplayMetric.AXIS_TICK]: { digits: 0, hasGrouping: false },
  [EDisplayMetric.HEATMAP_VALUE]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.HEATMAP_COORDINATE]: { digits: 3, hasGrouping: false },
  [EDisplayMetric.CHART_TOOLTIP_VALUE]: { digits: 2, hasGrouping: false },
  [EDisplayMetric.WALTER_LIETH_TOOLTIP_VALUE]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.COUNT]: { digits: 0, hasGrouping: false },
  [EDisplayMetric.CELL_SIZE_KM]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.ARC_MINUTES]: { digits: 1, hasGrouping: false },
  [EDisplayMetric.ARC_SECONDS]: { digits: 0, hasGrouping: false },
};

export const SERIES_DISPLAY_METRIC: Record<TSeriesKey, EDisplayMetric> = {
  tmax: EDisplayMetric.TEMPERATURE,
  tavg: EDisplayMetric.TEMPERATURE,
  tmin: EDisplayMetric.TEMPERATURE,
  prec: EDisplayMetric.PRECIPITATION,
};

export const EXPORT_UNITS = { TEMP: "°C", PREC: "mm", ALTITUDE: "m" } as const;
