// * the header is its own size container: whether title and controls fit side by side
// * depends on the card's width, not the viewport — the same card sits in different layouts.
// * `@3xl` (48rem) fits a two-line title next to both labelled toggles
export const CHART_CARD_HEADER_CLASSES = {
  CONTAINER: "@container mb-4",
  ROW: "flex flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between",
  // * takes the remaining width and may wrap; min-w-0 lets it shrink instead of pushing the controls
  TITLE: "min-w-0 flex-1",
  // * never shrinks or wraps; under the title as one row when the card is narrow
  CONTROLS: "flex shrink-0 flex-col items-start gap-2 @3xl:items-end",
} as const;
