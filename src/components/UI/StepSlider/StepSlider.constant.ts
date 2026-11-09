// * the slider keeps one physical size at every text size, so it never jumps as the text size it
// * sets changes: px for the thumb and track, rem ÷ --text-scale for the width and the glyphs
// * (still following the browser's own font size)
export const STEP_SLIDER = {
  THUMB_PX: 24,
  // * the range input's own height: the hit area, 44px below lg — laid out as 32px there too (a
  // * negative margin), so its row keeps its height and the extra reaches into the row's padding
  INPUT_HEIGHT_CLASS: "h-[32px] max-lg:-my-[6px] max-lg:h-[44px]",
} as const;

// * keys that move the slider: one step, or to an end — applied at once, unlike a drag
export const STEP_SLIDER_KEYS = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
} as const;

// * flat: a light grey track filled up to the thumb's centre (--step-fill, 0–1) in primary — WebKit
// * draws it as a gradient, Firefox as its progress bar; a 24px thumb in --color-slider-thumb with
// * a 1px outline border, no shadow; focused, an outline ring. Written out whole: Tailwind only
// * generates classes it finds as text
export const STEP_SLIDER_CLASSES = {
  ROOT: "flex w-[calc(15rem/var(--text-scale))] items-center gap-[calc(0.5rem/var(--text-scale))]",
  SMALL_GLYPH:
    "shrink-0 text-[length:var(--font-xs-unscaled)] leading-none font-medium text-[var(--color-text-secondary)]",
  LARGE_GLYPH:
    "shrink-0 text-[length:var(--font-xl-unscaled)] leading-none font-medium text-[var(--color-text-secondary)]",
  TRACK_AREA: "relative min-w-0 flex-1",
  INPUT: `${STEP_SLIDER.INPUT_HEIGHT_CLASS} block w-full cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-primary)_calc(12px+(100%-24px)*var(--step-fill)),var(--color-border)_0)] [&::-webkit-slider-thumb]:-mt-[10px] [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:h-[24px] [&::-webkit-slider-thumb]:w-[24px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-[var(--color-border)] [&::-webkit-slider-thumb]:bg-[var(--color-slider-thumb)] focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-solid focus-visible:[&::-webkit-slider-thumb]:outline-[var(--color-brand)] [&::-moz-range-track]:h-[4px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--color-border)] [&::-moz-range-progress]:h-[4px] [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[var(--color-primary)] [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:h-[24px] [&::-moz-range-thumb]:w-[24px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[var(--color-border)] [&::-moz-range-thumb]:bg-[var(--color-slider-thumb)] focus-visible:[&::-moz-range-thumb]:outline-2 focus-visible:[&::-moz-range-thumb]:outline-offset-2 focus-visible:[&::-moz-range-thumb]:outline-solid focus-visible:[&::-moz-range-thumb]:outline-[var(--color-brand)]`,
  // * a dot per step on the track, above it — so the current step's is hidden under the thumb;
  // * lighter on the filled part
  DOTS: "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2",
  DOT: "absolute top-0 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full",
  DOT_FILLED: "bg-[var(--color-slider-thumb)]",
  DOT_EMPTY: "bg-[var(--color-text-secondary)]",
  DOT_UNDER_THUMB: "invisible",
} as const;
