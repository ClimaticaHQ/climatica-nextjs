// * shown wherever a value is unknown (e.g. a statistic over a month the API didn't return)
export const MISSING_VALUE_LABEL = "—";

// * signs for differences — a real minus (U+2212), and ± for no difference
export const DIFFERENCE_SIGN = { PLUS: "+", MINUS: "\u2212", NONE: "\u00b1" } as const;
