"use client";

import { Chip } from "@/components/UI/Chip";
import { ALL_MONTHS, MONTH_NUMBERS } from "@/constants";
import { EFilterKey } from "@/enums";
import { areFilterControlsDisabled, toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterSection } from "../FilterSection";
import type { TFilterSectionRenderProps } from "../filters.type";

/** "All" or any months; deselecting the last month means all again. */
export function MonthsFilter({ values, availability, onChange }: TFilterSectionRenderProps) {
  const t = useTranslations();
  const isDisabled = areFilterControlsDisabled(availability);
  const selected = values.months === ALL_MONTHS ? [] : values.months;

  return (
    <FilterSection title={t("sidebar.sections.months")} availability={availability}>
      <div className="flex flex-wrap gap-2">
        <Chip
          label={t("sidebar.months.all")}
          isActive={values.months === ALL_MONTHS}
          disabled={isDisabled}
          onClick={() => onChange(EFilterKey.MONTHS, ALL_MONTHS)}
        />
        {MONTH_NUMBERS.map((month) => (
          <Chip
            key={month}
            label={t(`months.${month}`)}
            isActive={selected.includes(month)}
            disabled={isDisabled}
            onClick={() => onChange(EFilterKey.MONTHS, toggleFilterOption(selected, month))}
          />
        ))}
      </div>
    </FilterSection>
  );
}
