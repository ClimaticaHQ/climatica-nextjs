"use client";

import { Chip } from "@/components/UI/Chip";
import { EFilterKey } from "@/enums";
import {
  areFilterControlsDisabled,
  getVariableOptionStates,
  getVariablesNotes,
  toggleFilterOption,
} from "@/utils/filters.util";
import { useTranslations } from "next-intl";
import { FilterNote, FilterSection } from "../FilterSection";
import type { TFilterSectionRenderProps } from "../filters.type";

/** Variable chips; the last selected one stays on (locked). */
export function VariablesFilter({
  values,
  context,
  availability,
  onChange,
}: TFilterSectionRenderProps) {
  const t = useTranslations();
  const value = values.variables;
  const isDisabled = areFilterControlsDisabled(availability);
  const lockedVariable = value.length === 1 ? value[0] : undefined;
  const isLockShown = lockedVariable !== undefined && !isDisabled;

  return (
    <FilterSection title={t("sidebar.sections.variables")} availability={availability}>
      <div className="flex flex-wrap gap-2">
        {getVariableOptionStates(values, context).map((option) => (
          <Chip
            key={option.value}
            label={t(`sidebar.variables.${option.value}`)}
            isActive={value.includes(option.value)}
            disabled={isDisabled || option.isDisabled}
            isLocked={isLockShown && option.value === lockedVariable}
            onClick={() => onChange(EFilterKey.VARIABLES, toggleFilterOption(value, option.value))}
          />
        ))}
      </div>
      {getVariablesNotes(context).map(({ textKey, variant }) => (
        <FilterNote key={textKey} text={t(textKey)} variant={variant} className="mt-1.5" />
      ))}
    </FilterSection>
  );
}
