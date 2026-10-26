"use client";

import { Dropdown } from "@/components/UI";
import { disableOtherSide } from "@/utils/pair.util";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { SIDE_PICKER_LABEL_KEYS } from "./charts.constant";
import type { TSidePickerProps } from "./charts.type";

/** Which series a split panel shows — the other panel's series disabled. */
export function SidePicker({ side, entries, value, otherId, onChange }: TSidePickerProps) {
  const t = useTranslations();
  const labelId = useId();
  const options = disableOtherSide(
    entries.map((entry) => ({
      value: entry.series.id,
      label: entry.series.label,
      markerShape: entry.series.shape,
    })),
    otherId,
  );

  return (
    <>
      <span id={labelId} className="sr-only">
        {t(SIDE_PICKER_LABEL_KEYS[side])}
      </span>
      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        ariaLabelledBy={labelId}
        data-testid={`year-${side}-select`}
        optionTestIdPrefix={`year-${side}-option`}
      />
    </>
  );
}
