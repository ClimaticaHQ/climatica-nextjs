import { FlashBorderIcon, FlashGlowIcon, MonitorIcon, MoonIcon, SunIcon } from "@/components/svg";
import { FOCUS_RING_CLASS } from "@/constants";
import { ESettingsControlPlacement, ETextSize, ETheme, EUpdateFlashVariant } from "@/enums";
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

// * the text size slider's steps, smallest first
export const TEXT_SIZE_OPTIONS = [
  {
    value: ETextSize.SMALLER,
    labelKey: "settings.textSizeOptions.smaller",
  },
  {
    value: ETextSize.SMALL,
    labelKey: "settings.textSizeOptions.small",
  },
  {
    value: ETextSize.DEFAULT,
    labelKey: "settings.textSizeOptions.default",
  },
  {
    value: ETextSize.LARGE,
    labelKey: "settings.textSizeOptions.large",
  },
  {
    value: ETextSize.LARGER,
    labelKey: "settings.textSizeOptions.larger",
  },
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

// * each row's description id — its control is described by it
export const SETTINGS_DESCRIPTION_IDS = {
  TEXT_SIZE: "settings-text-size-description",
  UPDATE_HIGHLIGHT: "settings-update-highlight-description",
  BAR_STYLE: "settings-chart-bar-style-description",
} as const;

// * the line between sections and between rows, one source for both: a top band of the
// * background — a border can't be thinner than 1 CSS px, this is one device pixel on a
// * high-density screen. None above the first
const HAIRLINE =
  "bg-[linear-gradient(var(--color-divider),var(--color-divider))] bg-[length:100%_var(--divider-width)] bg-top bg-no-repeat first:bg-none";

// * a row's least height, whatever its control: a label and a description, or a 44px target in
// * its track
const ROW_MIN_HEIGHT = "min-h-[max(3rem,48px)]";

// * flat: one card, no shadows anywhere
export const SETTINGS_CLASSES = {
  // * one readable column — a label this far from its control is hard to follow on a wide screen
  CARD: "mx-auto w-full max-w-[40rem] px-4 sm:px-7 sm:py-1",
  SECTION: `${HAIRLINE} py-4 sm:py-5`,
  HEADING:
    "mb-1 text-[length:var(--font-md)] font-semibold text-[var(--color-text)] sm:text-[length:var(--font-reading-card-title)]",
  ROW: `${HAIRLINE} py-2.5 sm:py-3`,
  // * a switch labels itself across the whole row
  ROW_SELF_LABELLED: `grid ${ROW_MIN_HEIGHT}`,
  ROW_CONTENT: `flex ${ROW_MIN_HEIGHT} justify-between gap-x-4 gap-y-1 sm:gap-y-3`,
  // * FIT (a wide control): it sits beside the label while both fit at their natural widths (the
  // * label's basis is its own width), else it goes under it and takes the row's width (it grows;
  // * beside the label, the label takes the free space). Below `sm` the text block dissolves
  // * (contents): label and control on one line, the description under both across the row —
  // * under the control once that has wrapped. The control's line is the label's line height,
  // * the control centred on it and overflowing it, so it never pushes the description down (its
  // * 44px target is touch-target's); wrapped, it takes its own height. BESIDE (a narrow control): always on the right of the
  // * stacked label and description. BELOW: always under them
  PLACEMENT: {
    [ESettingsControlPlacement.FIT]: {
      CONTENT: "flex-wrap items-center *:last:grow",
      TEXT: "max-sm:contents",
      LABEL: "max-sm:flex-[1000_1_auto]",
      DESCRIPTION: "max-sm:order-last max-sm:basis-full",
      CONTROL: "*:grow max-sm:flex max-sm:items-center sm:contents",
      // * measured (useIsWrapped): CSS can't tell a wrapped flex item from one beside
      CONTROL_BESIDE: "max-sm:h-[calc(var(--font-sm)*1.6)]",
      CONTROL_WRAPPED: "max-sm:mt-1",
    },
    [ESettingsControlPlacement.BESIDE]: {
      CONTENT: "items-center",
      TEXT: "max-sm:gap-1",
      LABEL: "",
      DESCRIPTION: "",
      CONTROL: "contents",
      CONTROL_BESIDE: "",
      CONTROL_WRAPPED: "",
    },
    [ESettingsControlPlacement.BELOW]: {
      CONTENT: "flex-col max-sm:gap-y-3",
      TEXT: "max-sm:gap-1",
      LABEL: "",
      DESCRIPTION: "",
      CONTROL: "contents",
      CONTROL_BESIDE: "",
      CONTROL_WRAPPED: "",
    },
  },
  TEXT: "flex min-w-0 flex-[1000_1_auto] flex-col gap-0.5",
  LABEL: "text-[length:var(--font-sm)] text-[var(--color-text)]",
  // * no width of its own (w-0, then the text's): it wraps under the label instead of widening the
  // * text past the control
  DESCRIPTION: "w-0 min-w-full text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  DISABLED_LABEL: "opacity-50",
} as const;

const BAR_STYLE_NAME = "whitespace-nowrap text-center text-[length:var(--font-xs)]";

// * the bar style cards: from `sm` macOS Appearance-style (the selected thumbnail ringed — an
// * outline: no shadow); below `sm` iOS-style, a round indicator under each name. The selected
// * name in primary at every width; below ~22rem the cards shrink
export const BAR_STYLE_PICKER_CLASSES = {
  // * equal thirds, each at least as wide as its name on one line (a word is never broken)
  GROUP: "grid grid-cols-[repeat(3,minmax(min-content,1fr))] gap-2",
  CARD: `${FOCUS_RING_CLASS} group flex min-h-target min-w-0 cursor-pointer flex-col items-center gap-1.5 rounded-[var(--radius-sm)] p-1`,
  PREVIEW: "block h-auto w-full",
  THUMB:
    "block w-full max-w-[122px] overflow-hidden rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface)]",
  THUMB_SELECTED:
    "sm:outline-2 sm:outline-offset-2 sm:outline-solid sm:outline-[var(--color-primary)]",
  NAME: `${BAR_STYLE_NAME} text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]`,
  NAME_SELECTED: `${BAR_STYLE_NAME} font-semibold text-[var(--color-primary)]`,
  INDICATOR:
    "flex size-5 items-center justify-center rounded-full border border-[var(--color-border)] sm:hidden",
  INDICATOR_SELECTED:
    "flex size-5 items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-switch-knob)] sm:hidden",
} as const;
