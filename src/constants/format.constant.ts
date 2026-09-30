// * shown wherever a value is unknown (e.g. a statistic over a month the API didn't return)
export const MISSING_VALUE_LABEL = "—";

// * signs for differences — a real minus (U+2212), and ± for no difference
export const DIFFERENCE_SIGN = { PLUS: "+", MINUS: "\u2212", NONE: "\u00b1" } as const;

// * decimals in chart tooltips: the Walter-Lieth ones one, the standard charts' two
export const TOOLTIP_DIGITS = { WL: 1, STANDARD: 2 } as const;

// * decimals per value type wherever a value is shown: temperatures and Martonne one,
// * precipitation, counts and altitude none
export const VALUE_DIGITS = { TEMP: 1, PREC: 0, MARTONNE: 1 } as const;

// * the units the SVG exports print after a value (the same symbol in every locale)
export const EXPORT_UNITS = { TEMP: "°C", PREC: "mm", ALTITUDE: "m" } as const;
