"use client";

import { Dropdown } from "@/components/UI/Dropdown";
import { CLIMATE_PERIOD_LABELS, FULL_VARIABLES_CLIMATE_PERIOD } from "@/constants";
import { EFilterKey, EFilterNoteVariant } from "@/enums";
import { getGridSizeOptionStates, toCellSizeHandler } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { CellCountBadge } from "../CellCountBadge";
import { FilterNote, FilterSection } from "../FilterSection";
import { RESOLUTION_LABEL_CLASS } from "../filters.constant";
import { FilterSectionTitleContext } from "../filters.context";
import type { TFilterSectionRenderProps } from "../filters.type";

/** The grid resolution; on the heat map, also how many cells it loads and whether that's too many. */
export function ResolutionFilter({
  values,
  cellCount,
  isApplyBlocked,
  onChange,
}: TFilterSectionRenderProps) {
  const t = useTranslations();
  const isTitleShown = useContext(FilterSectionTitleContext);
  const options = getGridSizeOptionStates(values).map((option) => ({
    value: option.value,
    label: t(`cellSizes.${option.value.replace(".", "_")}`),
    // * only 30 s is ever withheld — it exists for one climate period's normals alone
    ...(option.isDisabled
      ? {
          disabled: true,
          description: t("cellSizes.onlyForPeriod", {
            period: CLIMATE_PERIOD_LABELS[FULL_VARIABLES_CLIMATE_PERIOD],
          }),
        }
      : {}),
  }));

  return (
    <FilterSection>
      <div className="flex flex-col gap-1.5">
        {isTitleShown && (
          <p className={RESOLUTION_LABEL_CLASS}>{t("climateStatistics.cellResolution")}</p>
        )}
        <Dropdown
          options={options}
          value={values.gridSize}
          onChange={toCellSizeHandler((gridSize) => onChange(EFilterKey.GRID_SIZE, gridSize))}
          className="w-full"
        />
      </div>
      {cellCount !== null && (
        <div className="mt-2 flex flex-col gap-1">
          <CellCountBadge count={cellCount} />
          {isApplyBlocked && (
            <FilterNote
              text={t("sidebar.cellCount.tooManyError")}
              variant={EFilterNoteVariant.ERROR}
            />
          )}
        </div>
      )}
    </FilterSection>
  );
}
