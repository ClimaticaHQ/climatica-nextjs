import { EFilterHintVariant } from "@/enums";

export const FILTER_HINT_CLASSES: Record<EFilterHintVariant, string> = {
  [EFilterHintVariant.INFO]: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  [EFilterHintVariant.MUTED]: "text-[11px] italic text-[var(--color-text-secondary)]",
  [EFilterHintVariant.ERROR]: "text-[length:var(--font-xs)] text-[var(--color-error)]",
};
