import { EBadgeSize } from "@/enums";

export const BADGE_CLASSES = {
  BASE: "inline-flex items-center whitespace-nowrap border font-medium",
  SIZE: {
    [EBadgeSize.SM]: "gap-1 rounded px-1.5 py-0.5 text-[10px] leading-none",
    [EBadgeSize.MD]:
      "gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--font-xs)]",
  },
  TRUNCATED: "min-w-0 max-w-full",
  TRUNCATED_CONTENT: "min-w-0 truncate",
} as const;
