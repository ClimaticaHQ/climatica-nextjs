import { EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";

// * Fixed WL scale: 10 °C = 20 mm, i.e. 2 mm of precipitation per 1 °C on the shared axis
const LINEAR_RATIO = 2;
// * Above the breakpoint, precipitation is compressed 1:10 relative to the linear part
const COMPRESSION_FACTOR = 10;
const PREC_BREAKPOINT = 100;
// * Tailwind v4's default `sm` breakpoint (--breakpoint-sm)
const TAILWIND_SM = "40rem";

/**
 * Up to 100 mm, precipitation is plotted linearly at 2 mm per °C (10 °C = 20 mm).
 * Above 100 mm it's compressed 1:10, i.e. 20 mm per °C.
 */
export const WALTER_LIETH_DIAGRAM = {
  PREC_BREAKPOINT,
  // * where the 100 mm line sits on the shared °C axis
  PREC_BREAKPOINT_AXIS_VALUE: PREC_BREAKPOINT / LINEAR_RATIO,
  LINEAR_RATIO,
  COMPRESSION_FACTOR,
  COMPRESSED_RATIO: LINEAR_RATIO * COMPRESSION_FACTOR,
  // precMax ≈ 2×tempMax is the classical convention's own baseline ratio, not a sign of
  // overflow — only widen the shared drawing domain when precMax exceeds that baseline
  // by a real margin, so normal climates keep the temp curve at its full visual range.
  WIDEN_THRESHOLD_RATIO: 2.2,
  // * domain bounds are rounded outward to this step (°C / scaled units) for clean ticks
  DOMAIN_ROUNDING_STEP: 5,
  // * fallback domain (°C / scaled units) when no series has data yet
  DEFAULT_DOMAIN: { tempMin: 0, tempMax: 30, precMax: 30, plotMax: 30 },
  MONTHS_PER_YEAR: 12,
  // * default left-to-right month order (0 = January) for the geometry utils; a
  // * southern-hemisphere diagram passes Jul–Jun instead
  CALENDAR_MONTH_ORDER: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  // * half a month of padding on each side of the x axis: month i sits at the centre of
  // * its band, exactly like the export's monthBandX — so the x domain is [-0.5, 11.5]
  MONTH_EDGE_PADDING: 0.5,
} as const;

export const WALTER_LIETH_DOT = {
  RADIUS: 4,
  ACTIVE_RADIUS: 6,
  // * below `sm` the months sit ~20 px apart; full-size markers would chop the line into
  // * short dashes, so they shrink there
  SMALL_RADIUS: 2.5,
  SMALL_ACTIVE_RADIUS: 4,
  STROKE_WIDTH: 1,
  ACTIVE_STROKE_WIDTH: 2,
  // * opacity of the other months' dots while one month is highlighted
  DIMMED_OPACITY: 0.15,
} as const;

/**
 * mm axis ticks. Linear zone: every 20 mm, so 0 and 100 mm (where compression starts) are
 * always ticks. Compressed zone: few, well-spaced ticks — 100 mm there spans only 5 °C of
 * axis, so a step under 200 mm would stack the labels on top of each other.
 */
export const WALTER_LIETH_PREC_TICKS = {
  LINEAR_STEP: 20,
  MIN_COMPRESSED_STEP: 200,
  MAX_COMPRESSED_TICKS: 3,
  NICE_COMPRESSED_STEPS: [200, 500, 1000, 2000, 5000],
} as const;

export const WALTER_LIETH_AXIS = {
  TICK_FONT_SIZE: 12,
  COMPACT_TICK_FONT_SIZE: 10,
  // * plot side margins: each y axis' width, from the chart edge to the axis line
  WIDTH: 34,
  COMPACT_WIDTH: 24,
  // * tick labels sit this far from the axis line, with no tick marks
  TICK_GAP: 4,
  // * °C / mm sit above their axis, this far over the plot top
  UNIT_LABEL_OFFSET: 8,
  UNIT_LABEL_FONT_WEIGHT: 600,
  // * the dashed line marking tempMax when precipitation widens the plot above it
  REFERENCE_LINE_OPACITY: 0.5,
} as const;

// * Some locales abbreviate months with a trailing period (uk "січ.", fr "janv.",
// * pt "jan."); axis labels drop it so every locale reads alike
export const MONTH_LABEL_TRAILING_PERIOD = /\.$/;

// * any leap-agnostic year and mid-month day, so no time zone can shift the formatted
// * date into a neighbouring month
export const MONTH_LABEL_REFERENCE_DATE = { YEAR: 2000, DAY: 15 } as const;

/** CSS custom property names — values live in global.css (light + html.dark). */
export const WALTER_LIETH_COLOR_VARS = {
  TEMP: "--color-wl-temp",
  PREC: "--color-wl-prec",
  HUMID_HATCH: "--color-wl-humid-hatch",
  ARID_HATCH: "--color-wl-arid-hatch",
  COMPRESSED_FILL: "--color-wl-compressed-fill",
  FROST: "--color-wl-frost",
  SERIES_A: "--color-wl-series-a",
  SERIES_B: "--color-wl-series-b",
} as const;

export const WALTER_LIETH_COLORS = {
  TEMP: `var(${WALTER_LIETH_COLOR_VARS.TEMP})`,
  PREC: `var(${WALTER_LIETH_COLOR_VARS.PREC})`,
  HUMID_HATCH: `var(${WALTER_LIETH_COLOR_VARS.HUMID_HATCH})`,
  ARID_HATCH: `var(${WALTER_LIETH_COLOR_VARS.ARID_HATCH})`,
  COMPRESSED_FILL: `var(${WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL})`,
  FROST: `var(${WALTER_LIETH_COLOR_VARS.FROST})`,
  SERIES: {
    [EWalterLiethSeriesId.A]: `var(${WALTER_LIETH_COLOR_VARS.SERIES_A})`,
    [EWalterLiethSeriesId.B]: `var(${WALTER_LIETH_COLOR_VARS.SERIES_B})`,
  },
} as const;

// * the WL legend's colors on screen (CSS vars); the export resolves the same vars
export const WALTER_LIETH_LEGEND_PALETTE = {
  temp: WALTER_LIETH_COLORS.TEMP,
  prec: WALTER_LIETH_COLORS.PREC,
  humidHatch: WALTER_LIETH_COLORS.HUMID_HATCH,
  aridHatch: WALTER_LIETH_COLORS.ARID_HATCH,
  perhumid: WALTER_LIETH_COLORS.COMPRESSED_FILL,
  frost: WALTER_LIETH_COLORS.FROST,
} as const;

/**
 * The frost band under a WL plot: one cell per month, filled when the month's mean minimum
 * is below the threshold (WL's "certain frost"; without absolute minima there's no
 * "probable frost"). Screen and export draw it in the same px.
 */
export const WALTER_LIETH_FROST = {
  // * °C; a month exactly at the threshold is not frost
  THRESHOLD: 0,
  // * px between the x axis and the band
  BAND_GAP: 3,
  BAND_HEIGHT: 6,
  // * px between neighbouring cells, so each month reads as its own cell
  CELL_GAP: 1,
  STROKE_WIDTH: 1,
} as const;

// * the frost band on screen: frost in its token, outlines and unknown months neutral
export const WALTER_LIETH_FROST_PALETTE = {
  frost: WALTER_LIETH_COLORS.FROST,
  neutral: "var(--color-border)",
} as const;

// * the band's room under every plot — reserved even without frost (and in standard charts),
// * so a plot's height never depends on its data and WL and standard plots stay equal
export const WALTER_LIETH_FROST_BAND_SPACE =
  WALTER_LIETH_FROST.BAND_GAP + WALTER_LIETH_FROST.BAND_HEIGHT;

/** The single diagram's layer colors — the WL convention (red temperature, blue precipitation). */
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
  // * the shaded series' solid >100 mm region, translucent so the other series stays visible
  OVERLAY_PERHUMID_OPACITY: 0.3,
  DOT_SHAPE: { [EWalterLiethSeriesId.A]: "circle", [EWalterLiethSeriesId.B]: "square" },
  // * which series each shading option hatches
  SHADED_SERIES: {
    [EWalterLiethShading.A]: EWalterLiethSeriesId.A,
    [EWalterLiethShading.B]: EWalterLiethSeriesId.B,
    [EWalterLiethShading.NONE]: null,
  },
} as const;

/**
 * Hatching, derived from the month width so it reads the same at every size (compact, full,
 * export): HUMID_LINES_PER_MONTH vertical lines per month, never closer than MIN_SPACING px.
 * Arid dots sit in the same columns, ARID_ROW_GAP_FACTOR dot diameters apart vertically.
 */
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
  // * extra width of the background-colored halo under each curve, so hatch lines and arid
  // * dots stop short of the stroke instead of touching it (reads as a gap-free line)
  HALO_EXTRA_WIDTH: 3,
  REFERENCE_WIDTH: 1,
} as const;

export const WALTER_LIETH_DASH = {
  // * overlay mode: line style encodes the variable (solid temp, dashed precip)
  OVERLAY_PREC: "6 4",
  GRID: "3 3",
  // * marks the top of the temperature scale when precipitation widens the plot above it
  TEMP_MAX_REFERENCE: "4 4",
} as const;

export const WALTER_LIETH_BREAKPOINT = {
  TAILWIND_SM,
  // * below Tailwind's `sm` (same as its `max-sm:` variant) — month labels switch to
  // * one letter and split view stacks vertically
  SMALL_SCREEN_MEDIA_QUERY: `(width < ${TAILWIND_SM})`,
} as const;

export const WALTER_LIETH_MONTH_FORMAT = {
  WIDE: "short",
  NARROW: "narrow",
} as const;
