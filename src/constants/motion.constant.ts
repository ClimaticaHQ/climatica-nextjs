import { EUpdateFlashVariant } from "@/enums";
import type { TMotionCssVariables } from "@/types";

// * UI motion — every duration here is skipped under prefers-reduced-motion. The CSS in
// * src/styles/motion.css reads these through MOTION_CSS_VARIABLES, set once on <html>
export const MOTION = {
  // * a SegmentedControl's active pill sliding to the selected option
  CONTROL_SLIDE_MS: 200,
  CONTROL_SLIDE_EASING: "cubic-bezier(0, 0, 0.2, 1)",
  // * a chart card crossfading its content when the chart type or layout changes; the new
  // * content rises into place from this offset
  CHART_CROSSFADE_MS: 180,
  CHART_CROSSFADE_EASING: "ease-out",
  CHART_CROSSFADE_OFFSET_PX: 4,
  // * a split panel expanding, collapsing or switching series: fade plus a slight scale-up,
  // * from the side the panel sits on in the split
  PANEL_EXPAND_MS: 200,
  PANEL_EXPAND_SCALE_FROM: 0.985,
  PANEL_EXPAND_EASING: "ease-out",
  // * a chart series toggled on or off: its bars / lines fade (Recharts animates the bars'
  // * size over the same time, and the series leaves the tooltip once it's done)
  CHART_SERIES_TOGGLE_MS: 400,
  CHART_SERIES_TOGGLE_EASING: "ease",
  // * the multi-period table's columns resizing when a period is added or removed
  TABLE_COLUMN_RESIZE_MS: 150,
  TABLE_COLUMN_RESIZE_EASING: "ease",
  // * the city page's filters tab opening / closing: the panel's height, then its content
  // * fading and sliding in slightly after it starts
  FILTERS_COLLAPSE_MS: 320,
  FILTERS_COLLAPSE_EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
  FILTERS_CONTENT_FADE_MS: 250,
  FILTERS_CONTENT_DELAY_MS: 60,
  FILTERS_CONTENT_EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
  // * filters auto-applying: only a fetch longer than the delay fades the chart card's
  // * content and runs the progress bar along its top edge — fast responses never flicker
  UPDATE_LOADING_DELAY_MS: 300,
  UPDATE_FADE_MS: 150,
  UPDATE_FADE_EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
  UPDATE_FADE_OPACITY: 0.55,
  UPDATE_PROGRESS_HEIGHT_PX: 2,
  UPDATE_PROGRESS_CYCLE_MS: 1200,
  // * the moving segment's share of the bar's width
  UPDATE_PROGRESS_SEGMENT: 0.3,
  // * a card whose data changed: its border turns green (with a soft glow in the Glow variant),
  // * then fades back — the glow's spread per variant is UPDATE_FLASH_GLOW_PX
  UPDATE_FLASH_MS: 800,
  UPDATE_FLASH_EASING: "ease-out",
  REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
} as const;

// * px — the flash's outer glow spread per variant; 0 draws the border only
export const UPDATE_FLASH_GLOW_PX: Record<EUpdateFlashVariant, number> = {
  [EUpdateFlashVariant.GLOW]: 3,
  [EUpdateFlashVariant.BORDER]: 0,
};

export const DEFAULT_UPDATE_FLASH_VARIANT = EUpdateFlashVariant.GLOW;

// * the glow's blur, as a multiple of its spread (UPDATE_FLASH_GLOW_PX)
export const UPDATE_FLASH_GLOW_BLUR_RATIO = 2;

// * the flash colors, read from the card when the flash starts (light / dark from global.css)
export const UPDATE_FLASH_TOKENS = {
  BORDER: "--color-update-flash-border",
  GLOW: "--color-update-flash-glow",
} as const;

// * set on a card while it flashes — `data-update-flash="active"` — for tests and styling
export const UPDATE_FLASH_ATTRIBUTE = "updateFlash";
export const UPDATE_FLASH_ACTIVE = "active";
// * and its variant — `data-update-flash-variant="glow" | "border"`
export const UPDATE_FLASH_VARIANT_ATTRIBUTE = "updateFlashVariant";

// * on <html> while motion is off — `data-motion="off"` — set by MotionRoot, read by motion.css
export const MOTION_ROOT_ATTRIBUTE = "motion";
export const MOTION_OFF = "off";

// * the names motion.css reads
export const MOTION_CSS_VAR = {
  CONTROL_SLIDE: "--motion-control-slide",
  CONTROL_SLIDE_EASING: "--motion-control-slide-easing",
  CHART_CROSSFADE: "--motion-chart-crossfade",
  CHART_CROSSFADE_EASING: "--motion-chart-crossfade-easing",
  CHART_CROSSFADE_OFFSET: "--motion-chart-crossfade-offset",
  PANEL_EXPAND: "--motion-panel-expand",
  PANEL_EXPAND_EASING: "--motion-panel-expand-easing",
  PANEL_EXPAND_SCALE_FROM: "--motion-panel-expand-scale-from",
  CHART_SERIES_TOGGLE: "--motion-chart-series-toggle",
  CHART_SERIES_TOGGLE_EASING: "--motion-chart-series-toggle-easing",
  TABLE_COLUMN_RESIZE: "--motion-table-column-resize",
  TABLE_COLUMN_RESIZE_EASING: "--motion-table-column-resize-easing",
  FILTERS_COLLAPSE: "--motion-filters-collapse",
  FILTERS_COLLAPSE_EASING: "--motion-filters-collapse-easing",
  FILTERS_CONTENT_FADE: "--motion-filters-content-fade",
  FILTERS_CONTENT_DELAY: "--motion-filters-content-delay",
  FILTERS_CONTENT_EASING: "--motion-filters-content-easing",
  UPDATE_FADE: "--motion-update-fade",
  UPDATE_FADE_EASING: "--motion-update-fade-easing",
  UPDATE_FADE_OPACITY: "--motion-update-fade-opacity",
  UPDATE_PROGRESS_HEIGHT: "--motion-update-progress-height",
  UPDATE_PROGRESS_CYCLE: "--motion-update-progress-cycle",
  UPDATE_PROGRESS_SEGMENT: "--motion-update-progress-segment",
  UPDATE_PROGRESS_TRAVEL: "--motion-update-progress-travel",
} as const;

const ms = (value: number) => `${value}ms`;
const px = (value: number) => `${value}px`;
const percent = (share: number) => `${share * 100}%`;

// * MOTION as CSS custom properties, set on <html> by the root layout
export const MOTION_CSS_VARIABLES: TMotionCssVariables = {
  [MOTION_CSS_VAR.CONTROL_SLIDE]: ms(MOTION.CONTROL_SLIDE_MS),
  [MOTION_CSS_VAR.CONTROL_SLIDE_EASING]: MOTION.CONTROL_SLIDE_EASING,
  [MOTION_CSS_VAR.CHART_CROSSFADE]: ms(MOTION.CHART_CROSSFADE_MS),
  [MOTION_CSS_VAR.CHART_CROSSFADE_EASING]: MOTION.CHART_CROSSFADE_EASING,
  [MOTION_CSS_VAR.CHART_CROSSFADE_OFFSET]: px(MOTION.CHART_CROSSFADE_OFFSET_PX),
  [MOTION_CSS_VAR.PANEL_EXPAND]: ms(MOTION.PANEL_EXPAND_MS),
  [MOTION_CSS_VAR.PANEL_EXPAND_EASING]: MOTION.PANEL_EXPAND_EASING,
  [MOTION_CSS_VAR.PANEL_EXPAND_SCALE_FROM]: String(MOTION.PANEL_EXPAND_SCALE_FROM),
  [MOTION_CSS_VAR.CHART_SERIES_TOGGLE]: ms(MOTION.CHART_SERIES_TOGGLE_MS),
  [MOTION_CSS_VAR.CHART_SERIES_TOGGLE_EASING]: MOTION.CHART_SERIES_TOGGLE_EASING,
  [MOTION_CSS_VAR.TABLE_COLUMN_RESIZE]: ms(MOTION.TABLE_COLUMN_RESIZE_MS),
  [MOTION_CSS_VAR.TABLE_COLUMN_RESIZE_EASING]: MOTION.TABLE_COLUMN_RESIZE_EASING,
  [MOTION_CSS_VAR.FILTERS_COLLAPSE]: ms(MOTION.FILTERS_COLLAPSE_MS),
  [MOTION_CSS_VAR.FILTERS_COLLAPSE_EASING]: MOTION.FILTERS_COLLAPSE_EASING,
  [MOTION_CSS_VAR.FILTERS_CONTENT_FADE]: ms(MOTION.FILTERS_CONTENT_FADE_MS),
  [MOTION_CSS_VAR.FILTERS_CONTENT_DELAY]: ms(MOTION.FILTERS_CONTENT_DELAY_MS),
  [MOTION_CSS_VAR.FILTERS_CONTENT_EASING]: MOTION.FILTERS_CONTENT_EASING,
  [MOTION_CSS_VAR.UPDATE_FADE]: ms(MOTION.UPDATE_FADE_MS),
  [MOTION_CSS_VAR.UPDATE_FADE_EASING]: MOTION.UPDATE_FADE_EASING,
  [MOTION_CSS_VAR.UPDATE_FADE_OPACITY]: String(MOTION.UPDATE_FADE_OPACITY),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_HEIGHT]: px(MOTION.UPDATE_PROGRESS_HEIGHT_PX),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_CYCLE]: ms(MOTION.UPDATE_PROGRESS_CYCLE_MS),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_SEGMENT]: percent(MOTION.UPDATE_PROGRESS_SEGMENT),
  // * the segment crosses the whole track: its own width times this
  [MOTION_CSS_VAR.UPDATE_PROGRESS_TRAVEL]: percent(1 / MOTION.UPDATE_PROGRESS_SEGMENT),
};
