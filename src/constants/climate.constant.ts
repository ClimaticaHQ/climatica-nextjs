export const MONTHS = {
  JANUARY: "Jan",
  FEBRUARY: "Feb",
  MARCH: "Mar",
  APRIL: "Apr",
  MAY: "May",
  JUNE: "Jun",
  JULY: "Jul",
  AUGUST: "Aug",
  SEPTEMBER: "Sep",
  OCTOBER: "Oct",
  NOVEMBER: "Nov",
  DECEMBER: "Dec",
} as const;

export const MONTHS_ARRAY = Object.values(MONTHS);

export const DEFAULT_MAP_CENTER = { lat: 40.4168, lng: -3.7038 };

export const CLIMATE_RANGE = {
  MIN_START: 1951,
  MAX_START: 1994,
  WINDOW: 30,
} as const;

export const CLIMATE_START = 1970;

export const CLIMATE_COMPARISON_COLORS = {
  A: {
    tmax: "var(--chart-compare-a-max)",
    tmin: "var(--chart-compare-a-min)",
    prec: "var(--chart-compare-a-prec)",
    tavg: "var(--chart-compare-a-tavg)",
  },
  B: {
    tmax: "var(--chart-compare-b-max)",
    tmin: "var(--chart-compare-b-min)",
    prec: "var(--chart-compare-b-prec)",
    tavg: "var(--chart-compare-b-tavg)",
  },
} as const;
