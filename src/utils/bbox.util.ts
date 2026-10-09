import { SIDEBAR_PARAMS } from "@/constants";
import type { TBbox } from "@/types";

/** The heat map box a URL selects, or null unless all four edges are there. */
export function parseBboxParams(params: URLSearchParams): TBbox | null {
  const north = params.get(SIDEBAR_PARAMS.BBOX_NORTH);
  const south = params.get(SIDEBAR_PARAMS.BBOX_SOUTH);
  const west = params.get(SIDEBAR_PARAMS.BBOX_WEST);
  const east = params.get(SIDEBAR_PARAMS.BBOX_EAST);
  if (north === null || south === null || west === null || east === null) return null;
  return { north: Number(north), south: Number(south), west: Number(west), east: Number(east) };
}
