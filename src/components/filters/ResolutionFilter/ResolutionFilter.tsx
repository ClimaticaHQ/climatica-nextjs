"use client";

import { CellSizeSelector } from "@/components/CellSizeSelector";
import { CLIMATE_PERIOD_LABELS, FULL_VARIABLES_CLIMATE_PERIOD } from "@/constants";
import { EFilterHintVariant } from "@/enums";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { getCellCountStatus } from "@/utils/cellCount.util";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { FilterHint } from "../FilterHint";
import { FilterSection, FilterSectionTitleContext } from "../FilterSection";
import type { TResolutionFilterProps } from "./ResolutionFilter.type";

/** The grid resolution; on the heat map, also how many cells it loads and whether that's too many. */
export function ResolutionFilter({
  value,
  options,
  cellCount,
  isApplyBlocked,
  onChange,
}: TResolutionFilterProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const isTitleShown = useContext(FilterSectionTitleContext);
  const cellStatus = cellCount === null ? null : getCellCountStatus(cellCount);
  const selectorOptions = options.map((option) => ({
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
      <CellSizeSelector
        activeSize={value}
        options={selectorOptions}
        onSelect={onChange}
        isLabelHidden={!isTitleShown}
      />
      {cellStatus !== null && cellCount !== null && (
        <div className="mt-2 flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[length:var(--font-xs)] font-medium ${cellStatus.colorClass}`}
          >
            {t(cellStatus.labelKey)}
            <span className="opacity-70">
              {t("sidebar.cellCount.label", {
                count: formatNumber(cellCount, { hasGrouping: true }),
              })}
            </span>
          </span>
          {isApplyBlocked && (
            <FilterHint
              text={t("sidebar.cellCount.tooManyError")}
              variant={EFilterHintVariant.ERROR}
            />
          )}
        </div>
      )}
    </FilterSection>
  );
}
