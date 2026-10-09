"use client";

import { FilterChip } from "@/components/FilterChip";
import { areFilterControlsDisabled, toggleFilterOption } from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterHint } from "../FilterHint";
import { FilterSection } from "../FilterSection";
import type { TVariablesFilterProps } from "./VariablesFilter.type";

/** Variable chips; the last selected one stays on — locked: not-allowed cursor, announced as disabled. */
export function VariablesFilter({
  value,
  options,
  availability,
  hints,
  onChange,
}: TVariablesFilterProps) {
  const t = useTranslations();
  const isDisabled = areFilterControlsDisabled(availability);
  const lockedVariable = value.length === 1 ? value[0] : undefined;
  const isLockShown = lockedVariable !== undefined && !isDisabled;

  return (
    <FilterSection title={t("sidebar.sections.variables")} availability={availability}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isLocked = isLockShown && option.value === lockedVariable;
          return (
            <FilterChip
              key={option.value}
              label={t(`sidebar.variables.${option.value}`)}
              isActive={value.includes(option.value)}
              disabled={isDisabled || option.isDisabled}
              isLocked={isLocked}
              onClick={() => onChange(toggleFilterOption(value, option.value))}
            />
          );
        })}
      </div>
      {hints.map(({ textKey, variant }) => (
        <FilterHint key={textKey} text={t(textKey)} variant={variant} className="mt-1.5" />
      ))}
    </FilterSection>
  );
}
