import {
  BAR_STYLES,
  OVERLAY_BAR_STYLES,
  OVERLAY_BARS,
  PHONE_OVERLAY_BARS,
  PRECIP_BAR,
  PRECIP_BAR_SHADES,
  SHAPE_ONLY_BAR_STYLE,
  WALTER_LIETH_DIAGRAM,
} from "@/constants";
import type {
  TAridityPalette,
  TBarStyle,
  TEntityBarSwatch,
  TEntityRole,
  TOverlayBarLayout,
  TOverlayBarLayoutArgs,
  TOverlayGapArgs,
  TFixedOverlayBarLayoutArgs,
  TPhoneOverlayBars,
  TSeriesHatch,
  TSwatchBarStyleArgs,
} from "@/types";
import { EChartBody } from "@/enums";

/** The narrowest month band (px) that holds `entityCount` bars at the minimum width. */
export const getMinOverlayBand = (entityCount: number, gap: number = OVERLAY_BARS.GAP) =>
  Math.max(entityCount, 1) * OVERLAY_BARS.MIN_WIDTH +
  (Math.max(entityCount, 1) - 1) * gap +
  OVERLAY_BARS.MIN_GROUP_GAP;

/** A month's bar width for a given gap: the group's share of the band, down to the minimum. */
function getBarSize(bandWidth: number, count: number, gap: number) {
  const gaps = (count - 1) * gap;
  const roomy = (bandWidth * OVERLAY_BARS.GROUP_SHARE - gaps) / count;
  const tightest = (bandWidth - OVERLAY_BARS.MIN_GROUP_GAP - gaps) / count;
  return Math.max(
    0,
    Math.min(OVERLAY_BARS.MAX_WIDTH, Math.max(roomy, Math.min(OVERLAY_BARS.MIN_WIDTH, tightest))),
  );
}

/**
 * The gap between a month's bars: the style's full gap while the bars can afford it, shrinking
 * linearly to its floor as they near the minimum width — judged by the bars' width at the floor,
 * so the gap never costs a scroll the floor would avoid. Continuous in the band: no jumps.
 */
export function getOverlayGap({ bandWidth, count, gap, minGap }: TOverlayGapArgs) {
  if (minGap >= gap) return gap;
  const room = getBarSize(bandWidth, count, minGap) - OVERLAY_BARS.MIN_WIDTH;
  const share = Math.min(
    Math.max(room / (OVERLAY_BARS.FULL_GAP_WIDTH - OVERLAY_BARS.MIN_WIDTH), 0),
    1,
  );
  return minGap + share * (gap - minGap);
}

/**
 * Each month's bars in an overlay — one source for the screen's bars, its curve points, the
 * settings' preview and the export: the group centred in the month's band, the bars side by side
 * in entity order, the gap between them getOverlayGap's. The visible entities split the group's
 * share of the band (fewer, wider) up to the maximum width; under the minimum the gap between
 * groups gives way first; below that (a plot that doesn't fit) the bars shrink with the band —
 * the scroll rule keeps that from happening on screen.
 */
export function getOverlayBarLayout({
  plotWidth,
  entityCount,
  gap: fullGap = OVERLAY_BARS.GAP,
  minGap = fullGap,
}: TOverlayBarLayoutArgs): TOverlayBarLayout {
  const count = Math.max(entityCount, 1);
  const bandWidth = plotWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR;
  const gap = getOverlayGap({ bandWidth, count, gap: fullGap, minGap });
  const barSize = getBarSize(bandWidth, count, gap);
  const group = count * barSize + (count - 1) * gap;
  const offsets = Array.from(
    { length: count },
    (_, i) => -group / 2 + i * (barSize + gap) + barSize / 2,
  );
  return { bandWidth, barSize, gap, offsets };
}

/** A phone overlay's bars (PHONE_OVERLAY_BARS): narrower past MAX_WIDE_COUNT entities. */
export function getPhoneOverlayBars(entityCount: number): TPhoneOverlayBars {
  const count = Math.max(entityCount, 1);
  const { WIDTH, NARROW_WIDTH, MAX_WIDE_COUNT, GAP, GROUP_GAP } = PHONE_OVERLAY_BARS;
  const barSize = count <= MAX_WIDE_COUNT ? WIDTH : NARROW_WIDTH;
  return { barSize, gap: GAP, band: count * barSize + (count - 1) * GAP + GROUP_GAP };
}

/** A month's bars at a fixed width and gap, centred in its band (a phone's overlay). */
export function getFixedOverlayBarLayout({
  plotWidth,
  entityCount,
  barSize,
  gap,
}: TFixedOverlayBarLayoutArgs): TOverlayBarLayout {
  const count = Math.max(entityCount, 1);
  const group = count * barSize + (count - 1) * gap;
  const offsets = Array.from(
    { length: count },
    (_, i) => -group / 2 + i * (barSize + gap) + barSize / 2,
  );
  return { bandWidth: plotWidth / WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR, barSize, gap, offsets };
}

/** An entity's curve point position, in months: its bar's centre (0 = January's centre). */
export const getCurvePointX = (monthIndex: number, offset: number, bandWidth: number) =>
  monthIndex + (bandWidth > 0 ? offset / bandWidth : 0);

/** One switch for the focus state — the chart and the table read it alike. */
export function getEntityRole(focusedId: string | null, id: string): TEntityRole {
  if (focusedId === null) return "plain";
  return focusedId === id ? "focus" : "context";
}

export function isBarStyle(value: unknown): value is TBarStyle {
  return BAR_STYLES.some((style) => style === value);
}

/** The shades style: the humid and arid steps of an entity's place, wrapping like its shape. */
export function getBarShades(place: number): TAridityPalette {
  return PRECIP_BAR_SHADES[Math.max(place, 0) % PRECIP_BAR_SHADES.length] ?? PRECIP_BAR_SHADES[0];
}

/** An overlay entity's bar fills: the semantic humid / arid, or with shades its place's steps. */
export function getOverlayBarFills(barStyle: TBarStyle, place: number): TAridityPalette {
  return OVERLAY_BAR_STYLES[barStyle].hasShades
    ? getBarShades(place)
    : { humid: PRECIP_BAR.HUMID, arid: PRECIP_BAR.ARID };
}

const ENTITY_BAR_SWATCHES = {
  hatch: (hatch) => ({ hatch }),
  plain: () => ({}),
  shades: (_hatch, place) => ({ hatch: "solid", fill: getBarShades(place).humid }),
} satisfies Record<TBarStyle, (hatch: TSeriesHatch, place: number) => TEntityBarSwatch>;

/**
 * The bar style an entity's swatch shows in a view — the one rule for chips, legend, values
 * table, tooltips and export: the setting's only where the view draws bars that differ per
 * entity (the standard overlay, precipitation shown); plain — the shape alone — everywhere else
 * (Walter-Lieth draws no bars, side by side one series per panel).
 */
export function getSwatchBarStyle({
  mode,
  body,
  barStyle,
  isPrecVisible,
}: TSwatchBarStyleArgs): TBarStyle {
  const drawsEntityBars = mode === "standard" && body === EChartBody.OVERLAY && isPrecVisible;
  return drawsEntityBars ? barStyle : SHAPE_ONLY_BAR_STYLE;
}

/**
 * An overlay entity's bars beside its shape, where it's named (chips, legend): its hatch; with
 * shades its humid step; plain: nothing — the shape alone.
 */
export function getEntityBarSwatch(
  barStyle: TBarStyle,
  hatch: TSeriesHatch,
  place: number,
): TEntityBarSwatch {
  return ENTITY_BAR_SWATCHES[barStyle](hatch, place);
}
