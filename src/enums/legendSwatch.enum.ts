/** What a legend swatch draws — one kind per visual encoding used by the charts. */
export enum ELegendSwatch {
  /** a curve: solid or dashed */
  LINE = "line",
  /** a precipitation bar */
  BAR = "bar",
  /** a series' marker shape (WL overlay: circle A, square B) */
  MARKER = "marker",
  /** WL humid period: vertical hatching */
  HUMID = "humid",
  /** WL arid period: dots */
  ARID = "arid",
  /** WL > 100 mm: solid fill */
  PERHUMID = "perhumid",
  /** WL frost band: a filled, outlined cell like the band's own */
  FROST = "frost",
  /** two swatches side by side — one entry serving series A and B (standard split) */
  PAIR = "pair",
}
