import type { TOptionDotProps } from "./Dropdown.type";

/** An option's colour dot — decorative; the label carries the meaning. */
export function OptionDot({ color }: TOptionDotProps) {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-[var(--radius-full)]"
      style={{ backgroundColor: color }}
    />
  );
}
