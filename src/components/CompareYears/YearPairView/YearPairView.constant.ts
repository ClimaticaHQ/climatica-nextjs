export const YEAR_PAIR_VIEW_CLASSES = {
  // * two panels side by side from `sm` (stacked below), each spanning the three tracks (header,
  // * plot, table) so the plots line up; with pickers, the swap button sits between them
  GRID: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  GRID_WITH_SWAP: "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
  SWAP: "flex justify-center sm:items-start sm:pt-1",
} as const;
