import { EStatValueSize } from "@/enums";

export const STAT_CARD_CLASSES = {
  CARD: "flex flex-col gap-1",
  LABEL: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  UNIT: "ml-1 text-[length:var(--font-sm)] font-normal text-[var(--color-text-secondary)]",
  SUB: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
} as const;

// * a number sits on one line; text (a city name) may wrap
export const STAT_VALUE_CLASSES: Record<EStatValueSize, string> = {
  [EStatValueSize.XL]:
    "text-[length:var(--font-xl)] font-bold leading-none text-[var(--color-text)]",
  [EStatValueSize.LG]: "text-[length:var(--font-lg)] font-bold leading-snug",
};
