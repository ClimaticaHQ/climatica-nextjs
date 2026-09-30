// * how a formatted number shows its sign
export enum ENumberSign {
  // * the locale's own minus for negatives, nothing for positives ("-3,5" / "12,3")
  AUTO = "auto",
  // * a real minus (U+2212) for negatives — the tables' style ("−3,5")
  MINUS = "minus",
  // * always signed, for differences: "+2,0", "−1,5", "±0,0"
  SIGNED = "signed",
}
