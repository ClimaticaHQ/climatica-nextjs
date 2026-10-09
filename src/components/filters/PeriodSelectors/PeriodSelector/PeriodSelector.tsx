"use client";

import { DotLabel } from "@/components/UI/DotLabel/DotLabel";
import { Dropdown } from "@/components/UI/Dropdown";
import { getClimatePeriodOptions, toClimatePeriodHandler } from "@/utils/filters.util";
import { useId } from "react";
import type { TPeriodSelectorProps } from "./PeriodSelector.type";

/** One side of the comparison: its label and colour, then the period select. */
export function PeriodSelector({
  label,
  accentColor,
  value,
  availablePeriods,
  otherPeriod,
  onChange,
  testIdPrefix,
}: TPeriodSelectorProps) {
  const labelId = useId();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div id={labelId}>
        <DotLabel label={label} dotColor={accentColor} />
      </div>
      <Dropdown
        options={getClimatePeriodOptions(availablePeriods, otherPeriod)}
        value={value}
        onChange={toClimatePeriodHandler(onChange)}
        ariaLabelledBy={labelId}
        accentColor={accentColor}
        isStretched
        className="w-full"
        data-testid={`${testIdPrefix}-select`}
        optionTestIdPrefix={`${testIdPrefix}-option`}
      />
    </div>
  );
}
