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

export const getMinOverlayBand = (entityCount: number, gap: number = OVERLAY_BARS.GAP) =>
  Math.max(entityCount, 1) * OVERLAY_BARS.MIN_WIDTH +
  (Math.max(entityCount, 1) - 1) * gap +
  OVERLAY_BARS.MIN_GROUP_GAP;

function getBarSize(bandWidth: number, count: number, gap: number) {
  const gaps = (count - 1) * gap;
  const roomy = (bandWidth * OVERLAY_BARS.GROUP_SHARE - gaps) / count;
  const tightest = (bandWidth - OVERLAY_BARS.MIN_GROUP_GAP - gaps) / count;
  return Math.max(
    0,
    Math.min(OVERLAY_BARS.MAX_WIDTH, Math.max(roomy, Math.min(OVERLAY_BARS.MIN_WIDTH, tightest))),
  );
}

export function getOverlayGap({ bandWidth, count, gap, minGap }: TOverlayGapArgs) {
  if (minGap >= gap) return gap;
  const room = getBarSize(bandWidth, count, minGap) - OVERLAY_BARS.MIN_WIDTH;
  const share = Math.min(
    Math.max(room / (OVERLAY_BARS.FULL_GAP_WIDTH - OVERLAY_BARS.MIN_WIDTH), 0),
    1,
  );
  return minGap + share * (gap - minGap);
}

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

export function getPhoneOverlayBars(entityCount: number): TPhoneOverlayBars {
  const count = Math.max(entityCount, 1);
  const { WIDTH, NARROW_WIDTH, MAX_WIDE_COUNT, GAP, GROUP_GAP } = PHONE_OVERLAY_BARS;
  const barSize = count <= MAX_WIDE_COUNT ? WIDTH : NARROW_WIDTH;
  return { barSize, gap: GAP, band: count * barSize + (count - 1) * GAP + GROUP_GAP };
}

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

export const getCurvePointX = (monthIndex: number, offset: number, bandWidth: number) =>
  monthIndex + (bandWidth > 0 ? offset / bandWidth : 0);

export function getEntityRole(focusedId: string | null, id: string): TEntityRole {
  if (focusedId === null) return "plain";
  return focusedId === id ? "focus" : "context";
}

export function isBarStyle(value: unknown): value is TBarStyle {
  return BAR_STYLES.some((style) => style === value);
}

export function getBarShades(place: number): TAridityPalette {
  return PRECIP_BAR_SHADES[Math.max(place, 0) % PRECIP_BAR_SHADES.length] ?? PRECIP_BAR_SHADES[0];
}

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

export function getSwatchBarStyle({
  mode,
  body,
  barStyle,
  isPrecVisible,
}: TSwatchBarStyleArgs): TBarStyle {
  const drawsEntityBars = mode === "standard" && body === EChartBody.OVERLAY && isPrecVisible;
  return drawsEntityBars ? barStyle : SHAPE_ONLY_BAR_STYLE;
}

export function getEntityBarSwatch(
  barStyle: TBarStyle,
  hatch: TSeriesHatch,
  place: number,
): TEntityBarSwatch {
  return ENTITY_BAR_SWATCHES[barStyle](hatch, place);
}
