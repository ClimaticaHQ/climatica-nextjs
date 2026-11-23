// * the item an indicator slides under, where no ARIA state marks it (the navbar's link being
// * opened, the Info page being opened): `data-indicator-active="true"`
export const INDICATOR_ACTIVE_ATTRIBUTE = "data-indicator-active";

// * how each list finds its active item (useSlidingIndicator)
export const SLIDING_INDICATOR_SELECTORS = {
  MARKED: `[${INDICATOR_ACTIVE_ATTRIBUTE}="true"]`,
  SECTION: '[aria-current="location"]',
  SEGMENT: '[aria-pressed="true"]',
} as const;

// * a Collapsible's frame and its open state, read when an indicator projects where its item
// * lands once every fold has finished (getFoldedRect)
export const COLLAPSIBLE_ATTRIBUTE = "data-collapsible";
export const COLLAPSIBLE_OPEN_ATTRIBUTE = "data-open";
export const COLLAPSIBLE_SELECTOR = `[${COLLAPSIBLE_ATTRIBUTE}]`;
