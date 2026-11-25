import { CELL_SIZES, FILTER_MAX_HEATMAP_CELLS } from "@/constants";
import type { TCellSize, TRegionArea } from "@/types";
import {
  countCellsInBounds,
  countCellsInPolygon,
  getFinestLoadableGrid,
  getPolygonBounds,
  shortGridLabel,
} from "@/utils";
import { useTranslations } from "next-intl";

export function useTooManyCellsMessage(gridSize: TCellSize) {
  const t = useTranslations();
  return (area: TRegionArea) => {
    const isPolygon = "polygon" in area;
    const bounds = isPolygon ? getPolygonBounds(area.polygon) : area.bbox;
    const suggestion = getFinestLoadableGrid(bounds);
    const values = {
      count: isPolygon
        ? countCellsInPolygon(area.polygon, gridSize)
        : countCellsInBounds(bounds, gridSize),
      boxCount: countCellsInBounds(bounds, gridSize),
      max: FILTER_MAX_HEATMAP_CELLS,
      grid: shortGridLabel(gridSize),
    };
    const shape = isPolygon ? "Polygon" : "";
    return suggestion === null
      ? t(`heatMap.tooManyCells${shape}AnyGrid`, {
          ...values,
          coarsest: shortGridLabel(CELL_SIZES.TEN_MINUTES),
        })
      : t(`heatMap.tooManyCells${shape}`, { ...values, suggestion: shortGridLabel(suggestion) });
  };
}
