import { EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";

// * the fixed Walter-Lieth scale: 10 °C = 20 mm (a protected convention)
const LINEAR_RATIO = 2;
// * above 100 mm precipitation is compressed 1:10 (a protected convention)
const COMPRESSION_FACTOR = 10;
const PREC_BREAKPOINT = 100;
const TAILWIND_SM = "40rem";

export const WALTER_LIETH_DIAGRAM = {
  PREC_BREAKPOINT,
  PREC_BREAKPOINT_AXIS_VALUE: PREC_BREAKPOINT / LINEAR_RATIO,
  LINEAR_RATIO,
  COMPRESSION_FACTOR,
  COMPRESSED_RATIO: LINEAR_RATIO * COMPRESSION_FACTOR,
  // precMax ≈ 2 × tempMax is the convention's own ratio, not overflow: widen the domain only past a real margin
  WIDEN_THRESHOLD_RATIO: 2.2,
  DOMAIN_ROUNDING_STEP: 5,
  DEFAULT_DOMAIN: { tempMin: 0, tempMax: 30, precMax: 30, plotMax: 30 },
  MONTHS_PER_YEAR: 12,
  CALENDAR_MONTH_ORDER: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  // * month i sits at the centre of its band, exactly like the export's monthBandX
  MONTH_EDGE_PADDING: 0.5,
} as const;

export const WALTER_LIETH_DOT = {
  RADIUS: 4,
  ACTIVE_RADIUS: 6,
  // * full-size markers would chop a phone's line into dashes
  SMALL_RADIUS: 2.5,
  SMALL_ACTIVE_RADIUS: 4,
  STROKE_WIDTH: 1,
  ACTIVE_STROKE_WIDTH: 2,
  DIMMED_OPACITY: 0.15,
} as const;

export const WALTER_LIETH_PREC_TICKS = {
  LINEAR_STEP: 20,
  MIN_COMPRESSED_STEP: 200,
  MAX_COMPRESSED_TICKS: 3,
  NICE_COMPRESSED_STEPS: [200, 500, 1000, 2000, 5000],
} as const;

export const WALTER_LIETH_AXIS = {
  TICK_FONT_SIZE: 12,
  COMPACT_TICK_FONT_SIZE: 10,
  WIDTH: 44,
  COMPACT_WIDTH: 30,
  NARROW_WIDTH: 34,
  NARROW_TICK_FONT_SIZE: 12,
  NARROW_TICK_COUNT: 4,
  TEMP_TICK_STEPS: [5, 10, 20, 50],
  TEMP_MAX_TICKS: 7,
  STANDARD_TEMP_MAX_TICKS: { WIDE: 9, NARROW: 6 },
  PREC_TICK_STEPS: [10, 20, 25, 50, 100, 200, 250, 500, 1000],
  PREC_MAX_TICKS: 7,
  TICK_GAP: 4,
  UNIT_LABEL_OFFSET: 8,
  UNIT_LABEL_SIZE_INCREMENT: 6,
  UNIT_LABEL_FONT_WEIGHT: 600,
  REFERENCE_LINE_OPACITY: 0.5,
} as const;

// * some locales abbreviate months with a trailing period (uk, fr, pt): axis labels drop it
export const MONTH_LABEL_TRAILING_PERIOD = /\.$/;

// * a mid-month day, so no time zone shifts the date into a neighbouring month
export const MONTH_LABEL_REFERENCE_DATE = { YEAR: 2000, DAY: 15 } as const;

export const WALTER_LIETH_COLOR_VARS = {
  TEMP: "--color-wl-temp",
  PREC: "--color-wl-prec",
  HUMID_HATCH: "--color-wl-humid-hatch",
  ARID_HATCH: "--color-wl-arid-hatch",
  COMPRESSED_FILL: "--color-wl-compressed-fill",
  FROST: "--color-wl-frost",
  FROST_OUTLINE: "--color-wl-frost-outline",
} as const;

export const WALTER_LIETH_COLORS = {
  TEMP: `var(${WALTER_LIETH_COLOR_VARS.TEMP})`,
  PREC: `var(${WALTER_LIETH_COLOR_VARS.PREC})`,
  HUMID_HATCH: `var(${WALTER_LIETH_COLOR_VARS.HUMID_HATCH})`,
  ARID_HATCH: `var(${WALTER_LIETH_COLOR_VARS.ARID_HATCH})`,
  COMPRESSED_FILL: `var(${WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL})`,
  FROST: `var(${WALTER_LIETH_COLOR_VARS.FROST})`,
  FROST_OUTLINE: `var(${WALTER_LIETH_COLOR_VARS.FROST_OUTLINE})`,
} as const;

export const WALTER_LIETH_LEGEND_PALETTE = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
  humidHatch: WALTER_LIETH_COLORS.HUMID_HATCH,
  aridHatch: WALTER_LIETH_COLORS.ARID_HATCH,
  perhumid: WALTER_LIETH_COLORS.COMPRESSED_FILL,
  frost: WALTER_LIETH_COLORS.FROST,
  frostOutline: WALTER_LIETH_COLORS.FROST_OUTLINE,
} as const;

export const WALTER_LIETH_FROST = {
  // * a month exactly at the threshold is not frost
  THRESHOLD: 0,
  // * reserved under every plot, frost or not, so sizes never change
  BAND_HEIGHT: { FULL: 14, COMPACT: 10 },
  TICK_LENGTH: 4,
  STROKE_WIDTH: 1,
} as const;

export const WALTER_LIETH_FROST_PALETTE = {
  frost: WALTER_LIETH_COLORS.FROST,
  outline: WALTER_LIETH_COLORS.FROST_OUTLINE,
  unknown: "var(--color-border)",
} as const;

/** the Walter-Lieth convention: red temperature, blue precipitation */
export const WALTER_LIETH_CONVENTION_COLORS = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
  humidHatch: WALTER_LIETH_COLORS.HUMID_HATCH,
  aridHatch: WALTER_LIETH_COLORS.ARID_HATCH,
  perhumid: WALTER_LIETH_COLORS.COMPRESSED_FILL,
  perhumidOpacity: 1,
} as const;

export const WALTER_LIETH_COMPARISON = {
  DEFAULT_SHADING: EWalterLiethShading.A,
  OVERLAY_PERHUMID_OPACITY: 0.3,
  SHADED_SERIES: {
    [EWalterLiethShading.A]: EWalterLiethSeriesId.A,
    [EWalterLiethShading.B]: EWalterLiethSeriesId.B,
    [EWalterLiethShading.NONE]: null,
  },
} as const;

export const WALTER_LIETH_HATCH = {
  HUMID_LINES_PER_MONTH: 5,
  MIN_SPACING: 3,
  HUMID_STROKE_WIDTH: 1,
  ARID_DOT_RADIUS: 1,
  ARID_ROW_GAP_FACTOR: 2.5,
} as const;

export const WALTER_LIETH_STROKE = {
  TEMP_WIDTH: 2,
  PREC_WIDTH: 1.5,
  // * so hatch lines and arid dots stop short of the stroke
  HALO_EXTRA_WIDTH: 3,
  REFERENCE_WIDTH: 1,
} as const;

export const WALTER_LIETH_DASH = {
  OVERLAY_PREC: "6 4",
  GRID: "3 3",
  TEMP_MAX_REFERENCE: "4 4",
} as const;

export const WALTER_LIETH_BREAKPOINT = {
  TAILWIND_SM,
  SMALL_SCREEN_MEDIA_QUERY: `(width < ${TAILWIND_SM})`,
} as const;

export const WALTER_LIETH_MONTH_FORMAT = {
  WIDE: "short",
  NARROW: "narrow",
} as const;
