import { FILTER_CHIP_CLASSES as C } from "@/constants";
import type { TFilterValueChipProps } from "./FilterValueChip.type";

/** A filter's current value; opens that filter's sheet — or, when disabled, why it is. */
export function FilterValueChip({
  value,
  ariaLabel,
  isChanged,
  isDisabled,
  onClick,
}: TFilterValueChipProps) {
  const variant = isDisabled ? C.DISABLED : isChanged ? C.CHANGED : C.DEFAULT;
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      onClick={onClick}
      className={C.BUTTON}
    >
      <span className={`${C.PILL} ${variant}`}>{value}</span>
    </button>
  );
}
