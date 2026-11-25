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

export function applyTextSize(size: ETextSize) {
  document.documentElement.style.setProperty(TEXT_SCALE_PROPERTY, String(TEXT_SIZE_SCALES[size]));
}

export function toTextScale(rootFontSize: string) {
  const px = parseFloat(rootFontSize);
  return Number.isFinite(px) && px > 0 ? px / BASE_ROOT_FONT_PX : BASE_TEXT_SCALE;
}

export function scaleChartFont({ size, textScale, min }: TScaleChartFontArgs) {
  return Math.max(min, size * textScale);
}
