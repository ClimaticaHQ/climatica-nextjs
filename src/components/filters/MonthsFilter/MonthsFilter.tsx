"use client";

import { FilterChip } from "@/components/FilterChip";
import { ALL_MONTHS, MONTH_NUMBERS } from "@/constants";
import { areFilterControlsDisabled, toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterSection } from "../FilterSection";
import type { TMonthsFilterProps } from "./MonthsFilter.type";

/** "All" or any months; deselecting the last month means all again. */
export function MonthsFilter({ value, availability, onChange }: TMonthsFilterProps) {
  const t = useTranslations();
  const isDisabled = areFilterControlsDisabled(availability);
  const selected = value === ALL_MONTHS ? [] : value;

  return (
    <FilterSection title={t("sidebar.sections.months")} availability={availability}>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={t("sidebar.months.all")}
          isActive={value === ALL_MONTHS}
          disabled={isDisabled}
          onClick={() => onChange(ALL_MONTHS)}
        />
        {MONTH_NUMBERS.map((month) => (
          <FilterChip
            key={month}
            label={t(`months.${month}`)}
            isActive={selected.includes(month)}
            disabled={isDisabled}
            onClick={() => onChange(toggleFilterOption(selected, month))}
          />
        ))}
      </div>
    </FilterSection>
  );
}
