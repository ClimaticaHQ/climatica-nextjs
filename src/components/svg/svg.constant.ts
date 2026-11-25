export const NESTED_CELLS = {
  WIDTH: 300,
  HEIGHT: 250,
  CLASS: "h-auto w-full max-w-[320px]",
  COARSE: { x: 70, y: 60, size: 150 },
  POINT_CELL: { col: 3, row: 2 },
  POINT_RADIUS: 3.5,
  COARSE_STROKE: 2,
  FINE_STROKE: 1.5,
  GRID_STROKE: 1,
  FONT_SIZE: 12,
  LABEL_INSET: 8,
  COARSE_LABEL_GAP: 10,
  FINE_LABEL_GAP: 18,
} as const;

export const BURGER_ICON_CLASSES = {
  ROOT: "flex h-5 w-5 flex-col items-center justify-center gap-[5px]",
  BAR: "block h-[2px] w-5 rounded-full bg-current transition-all duration-300",
  OUTER: "origin-center",
  TOP_OPEN: "translate-y-[7px] rotate-45",
  MIDDLE_OPEN: "scale-x-0 opacity-0",
  BOTTOM_OPEN: "-translate-y-[7px] -rotate-45",
} as const;
