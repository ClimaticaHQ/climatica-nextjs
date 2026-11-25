"use client";

import { FilterIcon } from "@/components/svg";
import { OptionMarker } from "@/components/UI/Dropdown/OptionMarker";
import { EChipVariant, ETextScale } from "@/enums";
import { useTranslations } from "next-intl";
import {
  BAR_CHIP_CLASSES as BAR,
  TOGGLE_CHIP_SCALE_CLASSES,
  TOGGLE_CHIP_CLASSES as TOGGLE,
} from "./Chip.constant";
import type {
  TAllFiltersChipProps,
  TChipProps,
  TToggleChipProps,
  TValueChipProps,
} from "./Chip.type";

export function Chip(props: TChipProps) {
  if (props.variant === EChipVariant.VALUE) return <ValueChip {...props} />;
  if (props.variant === EChipVariant.ALL_FILTERS) return <AllFiltersChip {...props} />;
  return <ToggleChip {...props} />;
}

function ToggleChip({
  label,
  isActive = false,
  disabled = false,
  isLocked = false,
  markerShape,
  markerHatch,
  markerFill,
  textScale = ETextScale.DEFAULT,
  onClick,
}: TToggleChipProps) {
  const state = disabled
    ? isActive
      ? TOGGLE.DISABLED_SELECTED
      : TOGGLE.DISABLED
    : isLocked
      ? TOGGLE.LOCKED
      : isActive
        ? TOGGLE.ACTIVE
        : TOGGLE.IDLE;

  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      disabled={disabled}
      aria-pressed={isActive}
      aria-disabled={isLocked || undefined}
      className={`${TOGGLE.BASE} ${TOGGLE_CHIP_SCALE_CLASSES[textScale]} ${state}`}
    >
      {markerShape === undefined ? (
        label
      ) : (
        <span className={TOGGLE.LABEL_WITH_MARKER}>
          <OptionMarker shape={markerShape} hatch={markerHatch} fill={markerFill} />
          {label}
        </span>
      )}
    </button>
  );
}

function ValueChip({ value, ariaLabel, isChanged, isDisabled, onClick }: TValueChipProps) {
  const state = isDisabled ? BAR.DISABLED : isChanged ? BAR.CHANGED : BAR.DEFAULT;
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      onClick={onClick}
      className={BAR.BUTTON}
    >
      <span className={`${BAR.PILL} ${state}`}>{value}</span>
    </button>
  );
}

function AllFiltersChip({ changedCount, onClick }: TAllFiltersChipProps) {
  const t = useTranslations();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={t("filters.chips.allFiltersLabel", { count: changedCount })}
      onClick={onClick}
      className={BAR.BUTTON}
    >
      <span className={`${BAR.PILL} ${BAR.ALL}`}>
        <FilterIcon className={BAR.ICON} />
        <span className={BAR.ALL_LABEL}>{t("filters.chips.allFilters")}</span>
        {changedCount > 0 && <span className={BAR.BADGE}>{changedCount}</span>}
      </span>
    </button>
  );
}
