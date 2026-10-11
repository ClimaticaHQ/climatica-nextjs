"use client";

import { FilterIcon } from "@/components/svg";
import { OptionDot } from "@/components/UI/Dropdown/OptionDot";
import { EChipVariant } from "@/enums";
import { useTranslations } from "next-intl";
import { BAR_CHIP_CLASSES as BAR, TOGGLE_CHIP_CLASSES as TOGGLE } from "./Chip.constant";
import type {
  TAllFiltersChipProps,
  TChipProps,
  TToggleChipProps,
  TValueChipProps,
} from "./Chip.type";

/**
 * A chip: a toggle (filters, years, chart variables), or — in the filter bar — a filter's value
 * or the all-filters chip, each opening a sheet.
 */
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
  dotColor,
  isStretched = false,
  onClick,
}: TToggleChipProps) {
  const state = disabled
    ? TOGGLE.DISABLED
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
      className={`${TOGGLE.BASE} ${state} ${isStretched ? TOGGLE.STRETCHED : ""}`}
    >
      {dotColor === undefined ? (
        label
      ) : (
        <span className={TOGGLE.LABEL_WITH_DOT}>
          <OptionDot color={dotColor} />
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
