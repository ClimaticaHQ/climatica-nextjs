import { EBadgeSize } from "@/enums";

export const BADGE_CLASSES = {
  BASE: "inline-flex items-center whitespace-nowrap border font-medium",
  SIZE: {
    // * 10px at the default size, and never smaller at a smaller text size
    [EBadgeSize.SM]: "gap-1 rounded px-1.5 py-0.5 text-[length:max(0.625rem,10px)] leading-none",
    [EBadgeSize.MD]:
      "gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--font-xs)]",
  },
  TRUNCATED: "min-w-0 max-w-full",
  TRUNCATED_CONTENT: "min-w-0 truncate",
} as const;
