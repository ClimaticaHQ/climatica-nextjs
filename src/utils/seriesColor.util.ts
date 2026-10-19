import { SERIES_COLOR_TOKENS, SERIES_TEXT_COLOR } from "@/constants/seriesColor.constant";
import type { EWalterLiethSeriesId } from "@/enums";
import type { TPairPalette, TSeriesTextColorArgs, TSeriesTint } from "@/types";

const cssVar = (token: string) => `var(${token})`;

/**
 * The one place a series gets its colour — by its position: its place in a list (compared
 * weather years), or its side of a compared pair (A, B).
 */

/** A listed series' line colour: by its place, wrapping past the palette; a missing place (-1) gets the first. */
export function getSeriesColor(position: number): string {
  const list = SERIES_COLOR_TOKENS.LIST;
  return cssVar(list[Math.max(position, 0) % list.length] ?? list[0]);
}

/** A listed series' bar colour: a quieter step of its line colour, by the same place. */
export function getSeriesBarColor(position: number): string {
  const list = SERIES_COLOR_TOKENS.BAR_LIST;
  return cssVar(list[Math.max(position, 0) % list.length] ?? list[0]);
}

/**
 * A listed series' badge colours (its tint set) and its dot, by the same place as
 * getSeriesColor — the dot a step darker than the line where the line misses 3:1 on the tint.
 */
export function getSeriesTint(position: number): TSeriesTint {
  const list = SERIES_COLOR_TOKENS.TINT_LIST;
  const tokens = list[Math.max(position, 0) % list.length] ?? list[0];
  return {
    bg: cssVar(tokens.bg),
    border: cssVar(tokens.border),
    text: cssVar(tokens.text),
    dot: cssVar(tokens.dot),
  };
}

/** A pair side's chart colours: its line colour for every temperature, its bar colour. */
export function getPairPalette(side: EWalterLiethSeriesId): TPairPalette {
  const { line, bar } = SERIES_COLOR_TOKENS.PAIR[side];
  return { tmax: cssVar(line), tmin: cssVar(line), tavg: cssVar(line), prec: cssVar(bar) };
}

/** A pair side's identity colour (Walter-Lieth, markers, the comparison table): its line colour. */
export function getPairIdentityColor(side: EWalterLiethSeriesId): string {
  return cssVar(SERIES_COLOR_TOKENS.PAIR[side].line);
}

/**
 * The colour of text naming or showing a series' values: the series' colour only for large
 * text, which needs 3:1; smaller text takes the text colour and the series shows by its marker.
 */
export function getSeriesTextColor({
  color,
  isLargeText,
  textColor = SERIES_TEXT_COLOR,
}: TSeriesTextColorArgs): string {
  return isLargeText ? color : textColor;
}
