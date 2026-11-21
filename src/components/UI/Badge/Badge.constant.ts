import { EBadgeSize } from "@/enums";

export const BADGE_CLASSES = {
  BASE: "inline-flex items-center whitespace-nowrap border font-medium",
  SIZE: {
    // * 10px at the default size, and never smaller at a smaller text size
    [EBadgeSize.SM]: "gap-1 rounded px-1.5 py-0.5 text-[length:max(0.625rem,10px)] leading-none",
    [EBadgeSize.MD]:
      "gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--font-xs)]",
    [EBadgeSize.LG]:
      "gap-2 rounded-[var(--radius-full)] px-3 py-1.5 text-[length:var(--font-base)]",
  },
  TRUNCATED: "min-w-0 max-w-full",
  PENDING: "animate-pulse",
  TRUNCATED_CONTENT: "min-w-0 truncate",
} as const;

// * a pending badge: fill, border and text all in the skeleton colour (the other skeletons' too)
export const PENDING_BADGE_TONE = {
  bg: "var(--color-border)",
  border: "var(--color-border)",
  text: "var(--color-border)",
} as const;
