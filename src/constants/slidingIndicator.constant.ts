// * the navbar link the pill slides under: the current page, or the one being opened
export const NAV_INDICATOR_ACTIVE_ATTRIBUTE = "data-indicator-active";

// * how each list finds its active item (useSlidingIndicator)
export const SLIDING_INDICATOR_SELECTORS = {
  NAV: `[${NAV_INDICATOR_ACTIVE_ATTRIBUTE}="true"]`,
  SECTION: '[aria-current="location"]',
  SEGMENT: '[aria-pressed="true"]',
} as const;
