import type { TSortArrowIconProps } from "./svg.type";

/** An arrow up (ascending) or down (descending) — a list's sort direction. */
export function SortArrowIcon({ isDescending }: TSortArrowIconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={isDescending ? "M6 2v8M3 7l3 3 3-3" : "M6 10V2M3 5l3-3 3 3"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
