import { FOCUS_RING_CLASS } from "@/constants";
import { EDisclosureSize } from "@/enums";

// * questions in a column, a hairline between them; the chevron turns when one is open
export const DISCLOSURE_CLASSES = {
  ROOT: "group border-b border-[var(--color-border)] last:border-b-0",
  SUMMARY: `${FOCUS_RING_CLASS} min-h-target flex cursor-pointer list-none items-center justify-between gap-4 rounded-[var(--radius-xs)] py-3 text-[var(--color-text)] hover:text-[var(--color-primary)] [&::-webkit-details-marker]:hidden`,
  CHEVRON:
    "shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200 group-open:rotate-180",
  CONTENT: "pb-4 text-[var(--color-text-secondary)]",
  // * LG: a heading for its answer, never smaller — the touch size below lg, 18px from lg
  SIZE: {
    [EDisclosureSize.MD]: { SUMMARY: "font-medium", CHEVRON: "" },
    [EDisclosureSize.LG]: {
      SUMMARY: "font-semibold text-[length:var(--font-touch-body)] lg:text-[length:var(--font-md)]",
      CHEVRON: "[&_svg]:size-4",
    },
  },
} as const;
