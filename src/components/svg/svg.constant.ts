// * the nested cells schematic (px in its viewBox): a light grid of coarse cells around one
// * filled coarse cell, the fine cell holding the point inside it
export const NESTED_CELLS = {
  WIDTH: 300,
  HEIGHT: 250,
  COARSE: { x: 70, y: 60, size: 150 },
  // * the fine cell holding the point: its column and row in the coarse cell, from the top left
  POINT_CELL: { col: 3, row: 2 },
  POINT_RADIUS: 3.5,
  COARSE_STROKE: 2,
  FINE_STROKE: 1.5,
  GRID_STROKE: 1,
  FONT_SIZE: 12,
  // * the coarse label above its cell; the fine label under the fine cell, both from the coarse cell's left
  LABEL_INSET: 8,
  COARSE_LABEL_GAP: 10,
  FINE_LABEL_GAP: 18,
} as const;
