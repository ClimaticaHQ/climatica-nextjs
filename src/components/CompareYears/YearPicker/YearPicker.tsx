"use client";

import { Dropdown } from "@/components/UI/Dropdown";
import { disableOtherSide } from "@/utils/pair.util";
import { useId } from "react";
import type { TYearPickerProps } from "./YearPicker.type";

/** Which compared year a diagram panel shows — the other panel's year disabled. */
export function YearPicker({
  label,
  value,
  years,
  otherYear,
  onChange,
  testIdPrefix,
}: TYearPickerProps) {
  const labelId = useId();
  const options = disableOtherSide(
    years.map(({ year, color }) => ({ value: String(year), label: String(year), color })),
    String(otherYear),
  );

  return (
    <>
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <Dropdown
        options={options}
        value={String(value)}
        onChange={(next) => onChange(Number(next))}
        ariaLabelledBy={labelId}
        data-testid={`${testIdPrefix}-select`}
        optionTestIdPrefix={`${testIdPrefix}-option`}
      />
    </>
  );
}
