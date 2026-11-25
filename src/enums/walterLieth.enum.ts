export enum EWalterLiethSeriesId {
  A = "a",
  B = "b",
}

export enum EWalterLiethShading {
  A = "a",
  B = "b",
  NONE = "none",
}

export enum EWalterLiethFrost {
  FROST = "frost",
  NONE = "none",
  /** no minimum temperature for the month: drawn neutral, never as frost */
  UNKNOWN = "unknown",
}

export enum EWalterLiethRegime {
  HUMID = "humid",
  PERHUMID = "perhumid",
  ARID = "arid",
}
