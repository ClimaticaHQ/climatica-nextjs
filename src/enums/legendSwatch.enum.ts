/** What a legend swatch draws — one kind per visual encoding used by the charts. */
export enum ELegendSwatch {
  /** a curve: solid or dashed */
  LINE = "line",
  /** a precipitation bar */
  BAR = "bar",
  /** an entity's marker shape (its curves' points) */
  MARKER = "marker",
  /** an overlay entity: its bars' hatch beside its curves' shape */
  ENTITY = "entity",
  /** WL humid period: vertical hatching */
  HUMID = "humid",
  /** WL arid period: dots */
  ARID = "arid",
  /** WL > 100 mm: solid fill */
  PERHUMID = "perhumid",
  /** WL frost band: a filled, outlined cell like the band's own */
  FROST = "frost",
}
