import type { TCellSize } from "../domain";

export type TCellBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

/** A raster cell: row and column counted from the north-west corner, from 0 */
export type TPointCell = { size: TCellSize; row: number; col: number };

/**
 * A point query's Redis key: the cell it reads and the rest of its request (variables and dataset).
 * expectedCells are the cells an answer must name to be stored.
 */
export type TPointCacheParts = {
  queryId: string;
  cell: TPointCell;
  variant: string | null;
  expectedCells: TPointCell[];
};
