import type { TCellSize } from "../domain";

export type TCellBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

export type TPointCell = { size: TCellSize; row: number; col: number };

/** expectedCells: the cells an answer must name to be stored */
export type TPointCacheParts = {
  queryId: string;
  cell: TPointCell;
  variant: string | null;
  expectedCells: TPointCell[];
};
