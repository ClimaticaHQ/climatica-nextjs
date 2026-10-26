// * between the parts of a split panel's period line: "Climate 1970–2000 · 658 m · differences vs Madrid"
export const PANEL_SUBTITLE_SEPARATOR = " · ";

// * from `sm` the panels sit side by side: each spans the split grid's three rows (header,
// * plot, monthly strip) as a subgrid, so both headers share one height and the plots and
// * strips start at the same y
// * `grid-cols-[minmax(0,1fr)]`: the panel's content may never push it wider than its column
export const SPLIT_PANEL_ROWS_CLASS =
  "grid-cols-[minmax(0,1fr)] sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:gap-y-0";

// * a split panel's card: its content must itself span the rows (SPLIT_PANEL_ROWS_CLASS)
export const SPLIT_PANEL_CARD_CLASS = `min-w-0 ${SPLIT_PANEL_ROWS_CLASS}`;
