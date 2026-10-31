import { EDisplayMetric } from "@/enums";
import type { TDisplayPrecision, TSeriesKey } from "@/types";

// * shown wherever a value is unknown (e.g. a statistic over a month the API didn't return)
export const MISSING_VALUE_LABEL = "—";

// * signs for differences — a real minus (U+2212), and ± for no difference
export const DIFFERENCE_SIGN = { PLUS: "+", MINUS: "\u2212", NONE: "\u00b1" } as const;

// * The one place display rounding is defined: every number the UI (and an image export) shows
// * is rounded to its metric's decimals and printed with them, and every difference is the
// * difference of those rounded values. Tooltips keep their own decimals.
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
};

// * the metric each chart variable is shown as
export const SERIES_DISPLAY_METRIC: Record<TSeriesKey, EDisplayMetric> = {
  tmax: EDisplayMetric.TEMPERATURE,
  tavg: EDisplayMetric.TEMPERATURE,
  tmin: EDisplayMetric.TEMPERATURE,
  prec: EDisplayMetric.PRECIPITATION,
};

// * the units the SVG exports print after a value (the same symbol in every locale)
export const EXPORT_UNITS = { TEMP: "°C", PREC: "mm", ALTITUDE: "m" } as const;
