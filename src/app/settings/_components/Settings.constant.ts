import { FlashBorderIcon, FlashGlowIcon, MonitorIcon, MoonIcon, SunIcon } from "@/components/svg";
import { ETheme, EUpdateFlashVariant } from "@/enums";

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
    key: "autoScroll",
    labelKey: "settings.autoScroll",
    descriptionKey: "settings.descriptions.autoScroll",
  },
] as const;

export const SETTINGS_ROW_IDS = {
  LANGUAGE: "settings-app-language",
  UPDATE_HIGHLIGHT: "settings-update-highlight",
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
