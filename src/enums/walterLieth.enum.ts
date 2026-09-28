/** A series' identity in a comparison — drives its overlay color (A green, B orange). */
export enum EWalterLiethSeriesId {
  A = "a",
  B = "b",
}

/** Which series gets the humid/arid hatching in overlay mode. */
export enum EWalterLiethShading {
  A = "a",
  B = "b",
  NONE = "none",
}

/**
 * Water balance of a region between the curves. Humid: P ≥ 2T (P = 2T counts as humid),
 * drawn hatched up to 100 mm. Perhumid: the part above 100 mm, drawn solid. Arid: P < 2T.
 */
export enum EWalterLiethRegime {
  HUMID = "humid",
  PERHUMID = "perhumid",
  ARID = "arid",
}
