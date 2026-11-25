import { EStatLabelSize, EStatValueSize } from "@/enums";

export const STAT_CARD_CLASSES = {
  CARD: "flex flex-col gap-1",
  LABEL: "text-[var(--color-text-secondary)]",
  UNIT: "ml-1 text-[length:var(--font-sm)] font-normal text-[var(--color-text-secondary)]",
  SUB: "text-[var(--color-text-secondary)]",
} as const;

export const STAT_LABEL_SIZE_CLASSES: Record<EStatLabelSize, string> = {
  [EStatLabelSize.XS]: "text-[length:var(--font-xs)]",
  [EStatLabelSize.BASE]: "text-[length:var(--font-base)]",
};

export const STAT_VALUE_CLASSES: Record<EStatValueSize, string> = {
  [EStatValueSize.XL]:
    "text-[length:var(--font-xl)] font-bold leading-none text-[var(--color-text)]",
  [EStatValueSize.LG]: "text-[length:var(--font-lg)] font-bold leading-snug",
};
