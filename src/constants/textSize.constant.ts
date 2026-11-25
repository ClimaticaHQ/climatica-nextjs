import { ETextSize } from "@/enums";
import { LOCAL_STORAGE_KEYS } from "./localStorageKeys.constant";

export const TEXT_SIZE_SCALES = {
  [ETextSize.SMALLER]: 0.875,
  [ETextSize.SMALL]: 0.9375,
  [ETextSize.DEFAULT]: 1,
  [ETextSize.LARGE]: 1.125,
  [ETextSize.LARGER]: 1.25,
} as const satisfies Record<ETextSize, number>;

export const TEXT_SCALE_PROPERTY = "--text-scale";

export const BASE_TEXT_SCALE = 1;

export const CHART_TEXT_MIN_PX = { TICK: 10, TEXT: 11 } as const;

export const BASE_ROOT_FONT_PX = 16;

/** runs before the first paint, before any bundle: plain ES5 in a string */
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
