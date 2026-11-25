import { EUpdateFlashVariant } from "@/enums";
import type { TMotionCssVariables } from "@/types";

// * animations.css reads these through MOTION_CSS_VARIABLES; prefers-reduced-motion skips them all
export const MOTION = {
  CONTROL_SLIDE_MS: 200,
  CONTROL_SLIDE_EASING: "cubic-bezier(0, 0, 0.2, 1)",
  NAV_INDICATOR_SLIDE_MS: 220,
  SECTION_INDICATOR_SLIDE_MS: 200,
  INDICATOR_SLIDE_EASING: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  ACCORDION_MS: 260,
  CHART_CROSSFADE_MS: 180,
  CHART_CROSSFADE_EASING: "ease-out",
  CHART_CROSSFADE_OFFSET_PX: 4,
  PANEL_EXPAND_MS: 200,
  PANEL_EXPAND_SCALE_FROM: 0.985,
  PANEL_EXPAND_EASING: "ease-out",
  // * Recharts animates the bars' size over the same time
  CHART_SERIES_TOGGLE_MS: 400,
  CHART_SERIES_TOGGLE_EASING: "ease",
  // * only a fetch longer than the delay shows the loading state: fast responses never flicker
  UPDATE_LOADING_DELAY_MS: 300,
  UPDATE_FADE_MS: 150,
  UPDATE_FADE_EASING: "cubic-bezier(0.4, 0, 0.2, 1)",
  UPDATE_FADE_OPACITY: 0.55,
  UPDATE_PROGRESS_HEIGHT_PX: 2,
  UPDATE_PROGRESS_CYCLE_MS: 1200,
  UPDATE_PROGRESS_SEGMENT: 0.3,
  UPDATE_FLASH_MS: 800,
  UPDATE_FLASH_EASING: "ease-out",
  SHEET_SLIDE_MS: 280,
  SHEET_SLIDE_EASING: "cubic-bezier(0.32, 0.72, 0, 1)",
  STATE_HOVER_MS: 120,
  STATE_HOVER_EASING: "ease-out",
  REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
} as const;

export const UPDATE_FLASH_GLOW_PX: Record<EUpdateFlashVariant, number> = {
  [EUpdateFlashVariant.GLOW]: 3,
  [EUpdateFlashVariant.BORDER]: 0,
};

export const DEFAULT_UPDATE_FLASH_VARIANT = EUpdateFlashVariant.GLOW;

export const UPDATE_FLASH_GLOW_BLUR_RATIO = 2;

export const UPDATE_FLASH_TOKENS = {
  BORDER: "--color-update-flash-border",
  GLOW: "--color-update-flash-glow",
} as const;

export const UPDATE_FLASH_ATTRIBUTE = "updateFlash";
export const UPDATE_FLASH_ACTIVE = "active";
export const ARRIVAL_FLASH_ATTRIBUTE = "data-arrival-key";
export const UPDATE_FLASH_VARIANT_ATTRIBUTE = "updateFlashVariant";

export const MOTION_ROOT_ATTRIBUTE = "motion";
export const MOTION_OFF = "off";

export const MOTION_CSS_VAR = {
  CONTROL_SLIDE: "--motion-control-slide",
  CONTROL_SLIDE_EASING: "--motion-control-slide-easing",
  NAV_INDICATOR_SLIDE: "--motion-nav-indicator-slide",
  SECTION_INDICATOR_SLIDE: "--motion-section-indicator-slide",
  INDICATOR_SLIDE_EASING: "--motion-indicator-slide-easing",
  ACCORDION: "--motion-accordion",
  CHART_CROSSFADE: "--motion-chart-crossfade",
  CHART_CROSSFADE_EASING: "--motion-chart-crossfade-easing",
  CHART_CROSSFADE_OFFSET: "--motion-chart-crossfade-offset",
  PANEL_EXPAND: "--motion-panel-expand",
  PANEL_EXPAND_EASING: "--motion-panel-expand-easing",
  PANEL_EXPAND_SCALE_FROM: "--motion-panel-expand-scale-from",
  CHART_SERIES_TOGGLE: "--motion-chart-series-toggle",
  CHART_SERIES_TOGGLE_EASING: "--motion-chart-series-toggle-easing",
  UPDATE_FADE: "--motion-update-fade",
  UPDATE_FADE_EASING: "--motion-update-fade-easing",
  UPDATE_FADE_OPACITY: "--motion-update-fade-opacity",
  UPDATE_PROGRESS_HEIGHT: "--motion-update-progress-height",
  UPDATE_PROGRESS_CYCLE: "--motion-update-progress-cycle",
  UPDATE_PROGRESS_SEGMENT: "--motion-update-progress-segment",
  UPDATE_PROGRESS_TRAVEL: "--motion-update-progress-travel",
  SHEET_SLIDE: "--motion-sheet-slide",
  SHEET_SLIDE_EASING: "--motion-sheet-slide-easing",
  STATE_HOVER: "--motion-state-hover",
  STATE_HOVER_EASING: "--motion-state-hover-easing",
} as const;

const ms = (value: number) => `${value}ms`;
const px = (value: number) => `${value}px`;
const percent = (share: number) => `${share * 100}%`;

export const MOTION_CSS_VARIABLES: TMotionCssVariables = {
  [MOTION_CSS_VAR.CONTROL_SLIDE]: ms(MOTION.CONTROL_SLIDE_MS),
  [MOTION_CSS_VAR.CONTROL_SLIDE_EASING]: MOTION.CONTROL_SLIDE_EASING,
  [MOTION_CSS_VAR.NAV_INDICATOR_SLIDE]: ms(MOTION.NAV_INDICATOR_SLIDE_MS),
  [MOTION_CSS_VAR.SECTION_INDICATOR_SLIDE]: ms(MOTION.SECTION_INDICATOR_SLIDE_MS),
  [MOTION_CSS_VAR.INDICATOR_SLIDE_EASING]: MOTION.INDICATOR_SLIDE_EASING,
  [MOTION_CSS_VAR.ACCORDION]: ms(MOTION.ACCORDION_MS),
  [MOTION_CSS_VAR.CHART_CROSSFADE]: ms(MOTION.CHART_CROSSFADE_MS),
  [MOTION_CSS_VAR.CHART_CROSSFADE_EASING]: MOTION.CHART_CROSSFADE_EASING,
  [MOTION_CSS_VAR.CHART_CROSSFADE_OFFSET]: px(MOTION.CHART_CROSSFADE_OFFSET_PX),
  [MOTION_CSS_VAR.PANEL_EXPAND]: ms(MOTION.PANEL_EXPAND_MS),
  [MOTION_CSS_VAR.PANEL_EXPAND_EASING]: MOTION.PANEL_EXPAND_EASING,
  [MOTION_CSS_VAR.PANEL_EXPAND_SCALE_FROM]: String(MOTION.PANEL_EXPAND_SCALE_FROM),
  [MOTION_CSS_VAR.CHART_SERIES_TOGGLE]: ms(MOTION.CHART_SERIES_TOGGLE_MS),
  [MOTION_CSS_VAR.CHART_SERIES_TOGGLE_EASING]: MOTION.CHART_SERIES_TOGGLE_EASING,
  [MOTION_CSS_VAR.UPDATE_FADE]: ms(MOTION.UPDATE_FADE_MS),
  [MOTION_CSS_VAR.UPDATE_FADE_EASING]: MOTION.UPDATE_FADE_EASING,
  [MOTION_CSS_VAR.UPDATE_FADE_OPACITY]: String(MOTION.UPDATE_FADE_OPACITY),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_HEIGHT]: px(MOTION.UPDATE_PROGRESS_HEIGHT_PX),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_CYCLE]: ms(MOTION.UPDATE_PROGRESS_CYCLE_MS),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_SEGMENT]: percent(MOTION.UPDATE_PROGRESS_SEGMENT),
  [MOTION_CSS_VAR.UPDATE_PROGRESS_TRAVEL]: percent(1 / MOTION.UPDATE_PROGRESS_SEGMENT),
  [MOTION_CSS_VAR.SHEET_SLIDE]: ms(MOTION.SHEET_SLIDE_MS),
  [MOTION_CSS_VAR.SHEET_SLIDE_EASING]: MOTION.SHEET_SLIDE_EASING,
  [MOTION_CSS_VAR.STATE_HOVER]: ms(MOTION.STATE_HOVER_MS),
  [MOTION_CSS_VAR.STATE_HOVER_EASING]: MOTION.STATE_HOVER_EASING,
};
