/**
 * when the precipitation is less than 100mm, the temperature and precipitation are linear,
 * when the precipitation is greater than 100mm, the temperature and precipitation are
 * compressed by a ratio of 20:1
 */
export const WALTER_LIETH_DIAGRAM = {
  PREC_BREAKPOINT: 100,
  LINEAR_RATIO: 2,
  COMPRESSED_RATIO: 20,
} as const;
