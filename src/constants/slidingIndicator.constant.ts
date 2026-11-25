export const INDICATOR_ACTIVE_ATTRIBUTE = "data-indicator-active";

export const SLIDING_INDICATOR_SELECTORS = {
  MARKED: `[${INDICATOR_ACTIVE_ATTRIBUTE}="true"]`,
  SECTION: '[aria-current="location"]',
  SEGMENT: '[aria-pressed="true"]',
} as const;

export const COLLAPSIBLE_ATTRIBUTE = "data-collapsible";
export const COLLAPSIBLE_OPEN_ATTRIBUTE = "data-open";
export const COLLAPSIBLE_SELECTOR = `[${COLLAPSIBLE_ATTRIBUTE}]`;
