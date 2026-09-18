/**
 * when the precipitation is less than 100mm, the temperature and precipitation are linear,
 * when the precipitation is greater than 100mm, the temperature and precipitation are
 * compressed by a ratio of 20:1
 */
export const WALTER_LIETH_DIAGRAM = {
  PREC_BREAKPOINT: 100,
  LINEAR_RATIO: 2,
  COMPRESSED_RATIO: 20,
  // precMax ≈ 2×tempMax is the classical convention's own baseline ratio, not a sign of
  // overflow — only widen the shared drawing domain when precMax exceeds that baseline
  // by a real margin, so normal climates keep the temp curve at its full visual range.
  WIDEN_THRESHOLD_RATIO: 2.2,
} as const;
