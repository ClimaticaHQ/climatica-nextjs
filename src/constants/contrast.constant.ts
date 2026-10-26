// * WCAG 2.x minimum contrast ratios: normal text (1.4.3), and large text or graphics and
// * component outlines (1.4.3, 1.4.11)
export const WCAG_CONTRAST = {
  TEXT: 4.5,
  LARGE_TEXT_OR_GRAPHIC: 3,
} as const;

// * WCAG 2.x relative luminance: the sRGB transfer function and the Rec. 709 channel weights
export const SRGB_LUMINANCE = {
  CHANNEL_MAX: 255,
  LINEAR_THRESHOLD: 0.04045,
  LINEAR_DIVISOR: 12.92,
  GAMMA_OFFSET: 0.055,
  GAMMA_DIVISOR: 1.055,
  GAMMA: 2.4,
  WEIGHTS: [0.2126, 0.7152, 0.0722],
  // * the flare added to both sides of a contrast ratio
  FLARE: 0.05,
} as const;
