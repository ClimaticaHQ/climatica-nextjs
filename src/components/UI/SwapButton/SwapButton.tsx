import { SwapIcon } from "@/components/svg";
import { FOCUS_RING_CLASS } from "@/constants";
import type { TSwapButtonProps } from "./SwapButton.type";

/** An icon button exchanging two sides — Period A and B, or the two years side by side. */
export function SwapButton({ label, onClick, className = "" }: TSwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${FOCUS_RING_CLASS} flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] ${className}`}
    >
      <SwapIcon />
    </button>
  );
}
