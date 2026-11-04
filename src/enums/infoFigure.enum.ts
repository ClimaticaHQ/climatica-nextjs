// * what an Info figure's annotation marks: a value on a month, a run of months, or a stats item
export enum EFigureAnchor {
  POINT = "point",
  SPAN = "span",
  STATS_ITEM = "statsItem",
}

// * where a span's bracket goes: in the band above the plot, or below the month labels
export enum EAnnotationBand {
  TOP = "top",
  BOTTOM = "bottom",
}
