import { ETextSize } from "@/enums";
import { LOCAL_STORAGE_KEYS } from "./localStorageKeys.constant";

// * the root font size's factor per text size; it multiplies the browser's own default size
// * (typography.css: html { font-size: calc(100% * var(--text-scale)) })
export const TEXT_SIZE_SCALES = {
  [ETextSize.SMALLER]: 0.875,
  [ETextSize.SMALL]: 0.9375,
  [ETextSize.DEFAULT]: 1,
  [ETextSize.LARGE]: 1.125,
  [ETextSize.LARGER]: 1.25,
} as const satisfies Record<ETextSize, number>;

export const TEXT_SCALE_PROPERTY = "--text-scale";

// * no scaling: the default text size at the browser's default 16px, and the exports' fixed size
export const BASE_TEXT_SCALE = 1;

// * on-screen chart text never goes below these (px), however small the text size: tick labels,
// * and everything else (unit titles, legend, annotation numbers, labels)
export const CHART_TEXT_MIN_PX = { TICK: 10, TEXT: 11 } as const;

// * the px of 1rem the type scale is written for: a root at this size is a text scale of 1
export const BASE_ROOT_FONT_PX = 16;

/**
 * Runs in <head> before the first paint, like the theme script, so a page never shows at the
 * wrong text size: the saved size's scale on <html>, nothing for a missing or invalid one.
 * Plain ES5 in a string — it runs before any bundle.
 */
export const TEXT_SIZE_INIT_SCRIPT = `(function () {
  try {
    var scales = ${JSON.stringify(TEXT_SIZE_SCALES)};
    var saved = localStorage.getItem(${JSON.stringify(LOCAL_STORAGE_KEYS.SETTINGS)});
    var size = saved ? ((JSON.parse(saved) || {}).state || {}).textSize : null;
    if (typeof size === "string" && Object.prototype.hasOwnProperty.call(scales, size)) {
      document.documentElement.style.setProperty(${JSON.stringify(TEXT_SCALE_PROPERTY)}, String(scales[size]));
    }
  } catch (e) {}
})();`;
