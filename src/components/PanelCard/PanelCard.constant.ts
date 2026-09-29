// * one panel of a split comparison: a light card on the card surface, smaller radius and
// * padding than the outer chart card (16 px from `sm`, 10 px below), no shadow
export const PANEL_CARD_CLASS =
  "min-w-0 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 sm:p-4";

// * from `sm` the panels sit side by side: each spans the split grid's two rows (header,
// * plot) as a subgrid, so both headers share one height and the plots start at the same y
// * `grid-cols-[minmax(0,1fr)]`: the panel's content may never push it wider than its column
export const PANEL_CARD_ROWS_CLASS =
  "grid-cols-[minmax(0,1fr)] sm:row-span-2 sm:grid sm:grid-rows-subgrid sm:gap-y-0";
