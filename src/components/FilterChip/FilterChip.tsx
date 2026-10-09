import { OptionDot } from "@/components/UI/Dropdown/OptionDot";
import { FOCUS_RING_CLASS } from "@/constants";
import type { TFilterChipProps } from "./FilterChip.type";

export default function FilterChip({
  label,
  isActive = false,
  disabled = false,
  isLocked = false,
  dotColor,
  onClick,
}: TFilterChipProps) {
  if (onClick !== undefined) {
    return (
      <button
        type="button"
        onClick={isLocked ? undefined : onClick}
        disabled={disabled}
        aria-pressed={isActive}
        aria-disabled={isLocked || undefined}
        className={`${FOCUS_RING_CLASS} whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-medium transition-colors duration-150 ${
          disabled
            ? "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] opacity-35"
            : isLocked
              ? "cursor-not-allowed border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]"
              : isActive
                ? "cursor-pointer border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]"
                : "cursor-pointer border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-chip-active-border)] hover:text-[var(--color-chip-active-text)]"
        }`}
      >
        {dotColor === undefined ? (
          label
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <OptionDot color={dotColor} />
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <span className="whitespace-nowrap rounded-full bg-[var(--color-primary-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
      {label}
    </span>
  );
}
