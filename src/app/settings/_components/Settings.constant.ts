import { FlashBorderIcon, FlashGlowIcon, MonitorIcon, MoonIcon, SunIcon } from "@/components/svg";
import { FOCUS_RING_CLASS } from "@/constants";
import { ETheme, EUpdateFlashVariant } from "@/enums";
import type { TBarStyleOption } from "./Settings.type";

// * each section's title id — the section is named by it
export const SETTINGS_SECTION_IDS = {
  LANGUAGE: "settings-language",
  APPEARANCE: "settings-appearance",
  CHARTS_AND_FILTERS: "settings-charts-and-filters",
} as const;

export const THEME_OPTIONS = [
  { value: ETheme.LIGHT, labelKey: "settings.themeOptions.light", Icon: SunIcon },
  { value: ETheme.DARK, labelKey: "settings.themeOptions.dark", Icon: MoonIcon },
  { value: ETheme.SYSTEM, labelKey: "settings.themeOptions.system", Icon: MonitorIcon },
] as const;

export const UPDATE_HIGHLIGHT_OPTIONS = [
  {
    value: EUpdateFlashVariant.GLOW,
    labelKey: "settings.updateHighlightGlow",
    Icon: FlashGlowIcon,
  },
  {
    value: EUpdateFlashVariant.BORDER,
    labelKey: "settings.updateHighlightBorder",
    Icon: FlashBorderIcon,
  },
] as const;

// * the charts and filters section's switches, in order
export const BEHAVIOUR_SETTINGS = [
  {
    key: "autoApplyFilters",
    labelKey: "settings.autoApplyFilters",
    descriptionKey: "settings.descriptions.autoApplyFilters",
  },
  {
    key: "syncCity",
    labelKey: "settings.syncCity",
    descriptionKey: "settings.descriptions.syncCity",
  },
  {
    key: "syncFilters",
    labelKey: "settings.syncFilters",
    descriptionKey: "settings.descriptions.syncFilters",
  },
  {
    key: "autoScroll",
    labelKey: "settings.autoScroll",
    descriptionKey: "settings.descriptions.autoScroll",
  },
] as const;

// * the bar style cards, in BAR_STYLES' order: the default first
export const BAR_STYLE_OPTIONS = [
  {
    value: "plain",
    labelKey: "settings.barStyleOptions.plain",
    descriptionKey: "settings.barStyleDescriptions.plain",
  },
  {
    value: "shades",
    labelKey: "settings.barStyleOptions.shades",
    descriptionKey: "settings.barStyleDescriptions.shades",
  },
  {
    value: "hatch",
    labelKey: "settings.barStyleOptions.hatch",
    descriptionKey: "settings.barStyleDescriptions.hatch",
  },
] as const satisfies readonly TBarStyleOption[];

// * a bar style card's thumbnail (px, at the real chart's scale, so its gaps and hatches are the
// * chart's): three months of three entities' bars, a Tmax and a Tmin curve over them
export const BAR_STYLE_PREVIEW = {
  WIDTH: 120,
  HEIGHT: 76,
  PLOT: { LEFT: 6, RIGHT: 6, TOP: 8, BOTTOM: 6 },
  // * per month, each entity's bar: its height (a share of the plot) and whether it's arid
  MONTHS: [
    [
      { height: 0.5, isArid: false },
      { height: 0.72, isArid: false },
      { height: 0.38, isArid: false },
    ],
    [
      { height: 0.22, isArid: true },
      { height: 0.46, isArid: false },
      { height: 0.16, isArid: true },
    ],
    [
      { height: 0.66, isArid: false },
      { height: 0.3, isArid: true },
      { height: 0.56, isArid: false },
    ],
  ],
  // * each curve at the months' centres: a share of the plot from its top
  CURVES: [
    { variable: "tmax", points: [0.2, 0.08, 0.24] },
    { variable: "tmin", points: [0.52, 0.42, 0.58] },
  ],
  CURVE_WIDTH: 1.5,
  POINT_RADIUS: 1.75,
} as const;

export const SETTINGS_ROW_IDS = {
  LANGUAGE: "settings-app-language",
  UPDATE_HIGHLIGHT: "settings-update-highlight",
  BAR_STYLE: "settings-chart-bar-style",
} as const;

export const SETTINGS_CLASSES = {
  // * one readable column — a label this far from its control is hard to follow on a wide screen
  CARD: "mx-auto w-full max-w-2xl",
  GROUPS: "flex flex-col divide-y divide-[var(--color-border)]",
  GROUP: "py-5 first:pt-1 last:pb-1",
  HEADING: "mb-1 text-[length:var(--font-md)] font-semibold text-[var(--color-text)]",
  // * every row the same height rhythm, a hairline between rows
  ROWS: "flex flex-col divide-y divide-[var(--color-border)] *:py-3 *:last:pb-0",
  ROW: "flex items-center justify-between gap-4",
  // * a control too wide to sit beside its label on a phone: under it there, centred
  ROW_WIDE:
    "flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
  CONTROL_WIDE: "self-center sm:self-auto",
  TEXT: "flex min-w-0 flex-col gap-0.5",
  LABEL: "text-[length:var(--font-sm)] text-[var(--color-text)]",
  DESCRIPTION: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  DISABLED_LABEL: "opacity-50",
  // * the description and the disabled hint share one cell, so the row is as tall as the longer
  // * of the two whichever shows
  TEXT_STACK: "grid *:col-start-1 *:row-start-1",
  HIDDEN_TEXT: "invisible",
  // * the sub-settings: indented under their parent behind a thin line, no divider between
  DEPENDENT: "flex flex-col gap-3",
  DEPENDENT_CHILDREN: "ml-2 flex flex-col gap-3 border-l border-[var(--color-border)] pl-4",
} as const;

// * the bar style cards: macOS Appearance-style on desktop (the selected thumbnail ringed, its
// * name bold); below `sm` iOS-style, a round indicator under each name
export const BAR_STYLE_PICKER_CLASSES = {
  // * below `sm` the three share the row, each thumbnail scaled to its third; from `sm` at size
  GROUP: "flex w-full max-w-sm items-start gap-2 sm:w-auto sm:max-w-none sm:shrink-0 sm:gap-3",
  CARD: `${FOCUS_RING_CLASS} group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-[var(--radius-sm)] p-1 sm:flex-none`,
  PREVIEW: "block h-auto w-full sm:w-auto",
  THUMB:
    "block w-full overflow-hidden rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow duration-150 sm:w-auto",
  THUMB_SELECTED:
    "sm:ring-2 sm:ring-[var(--color-primary)] sm:ring-offset-2 sm:ring-offset-[var(--color-surface)]",
  NAME: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]",
  NAME_SELECTED: "text-[length:var(--font-xs)] font-semibold text-[var(--color-text)]",
  INDICATOR:
    "flex size-5 items-center justify-center rounded-full border border-[var(--color-border)] sm:hidden",
  INDICATOR_SELECTED:
    "flex size-5 items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-switch-knob)] sm:hidden",
} as const;
