"use client";

import { EDisplayMetric } from "@/enums";
import type { TCellSize, TVariable } from "@/types";
import { getCellSizeKm } from "@/utils/info.util";
import { useTranslations } from "next-intl";
import { useDisplayFormat } from "../ui/useDisplayFormat";
import { useGridArcLabel } from "../ui/useGridArcLabel";

/**
 * Data & methods' logic, so the page only composes: grids, cells, elevations, temperatures and
 * variable lists in the locale's words and digits.
 */
export function useDataPage() {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const arcLabel = useGridArcLabel();

  return {
    arcLabel,
    elevation: (value: number) => formatValue(value, { metric: EDisplayMetric.ELEVATION }),
    temperature: (value: number) => formatValue(value, { metric: EDisplayMetric.TEMPERATURE }),
    /** a grid's cell: its arc size and its width in km */
    cellLabel: (grid: TCellSize) =>
      t("info.data.cell.cellLabel", {
        size: arcLabel(grid),
        km: formatValue(getCellSizeKm(grid), { metric: EDisplayMetric.CELL_SIZE_KM }),
      }),
    variableNames: (variables: readonly TVariable[]) =>
      variables.map((variable) => t(`sidebar.variables.${variable}`)).join(", "),
  };
}
