import { CELL_SIZES, FILTER_MAX_HEATMAP_CELLS } from "@/constants";
import type { TBbox, TCellSize } from "@/types";
import { countCellsInBounds, getFinestLoadableGrid, shortGridLabel } from "@/utils";
import { useTranslations } from "next-intl";

/**
 * Why a heat map region isn't loaded: more cells than the cap at this resolution. Names the
 * finest resolution it fits at, or asks for a smaller region when even the coarsest is too fine.
 */
export function useTooManyCellsMessage(gridSize: TCellSize) {
  const t = useTranslations();
  return (bounds: TBbox) => {
    const suggestion = getFinestLoadableGrid(bounds);
    const values = { count: countCellsInBounds(bounds, gridSize), max: FILTER_MAX_HEATMAP_CELLS };
    return suggestion === null
      ? t("heatMap.tooManyCellsAnyGrid", {
          ...values,
          grid: shortGridLabel(CELL_SIZES.TEN_MINUTES),
        })
      : t("heatMap.tooManyCells", {
          ...values,
          grid: shortGridLabel(gridSize),
          suggestion: shortGridLabel(suggestion),
        });
  };
}
