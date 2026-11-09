import {
  BASE_ROOT_FONT_PX,
  BASE_TEXT_SCALE,
  TEXT_SCALE_PROPERTY,
  TEXT_SIZE_SCALES,
} from "@/constants";
import { ETextSize } from "@/enums";
import type { TScaleChartFontArgs } from "@/types";

export function isTextSize(value: unknown): value is ETextSize {
  return Object.values(ETextSize).some((size) => size === value);
}

/** Shows the text size: its scale as --text-scale on <html>, which typography.css reads. */
export function applyTextSize(size: ETextSize) {
  document.documentElement.style.setProperty(TEXT_SCALE_PROPERTY, String(TEXT_SIZE_SCALES[size]));
}

/**
 * The effective text scale from the root's computed font size: the browser's default size and
 * the app's text size together (20px × Larger = 1.5625). 1 when it can't be read.
 */
export function toTextScale(rootFontSize: string) {
  const px = parseFloat(rootFontSize);
  return Number.isFinite(px) && px > 0 ? px / BASE_ROOT_FONT_PX : BASE_TEXT_SCALE;
}

/** An on-screen chart's text size at a text scale, never below its floor (CHART_TEXT_MIN_PX). */
export function scaleChartFont({ size, textScale, min }: TScaleChartFontArgs) {
  return Math.max(min, size * textScale);
}
