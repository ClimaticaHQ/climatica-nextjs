import { ECardBackground, ECardPadding, ECardSize } from "@/enums";

export const CARD_FRAME_CLASS = "border border-[var(--color-border)]";

export const CARD_BACKGROUND_CLASSES: Record<ECardBackground, string> = {
  [ECardBackground.DEFAULT]: "bg-[var(--color-surface)]",
  [ECardBackground.MUTED]: "bg-[var(--color-surface-secondary)]",
};

export const CARD_SIZE_CLASSES: Record<ECardSize, string> = {
  [ECardSize.LG]: "rounded-[var(--radius-lg)]",
  [ECardSize.MD]: "rounded-[var(--radius-md)]",
  [ECardSize.SM]: "rounded-[var(--radius-sm)]",
};

export const CARD_PADDING_CLASSES: Record<ECardPadding, string> = {
  [ECardPadding.NONE]: "",
  [ECardPadding.PANEL]: "p-2.5 sm:p-4",
  [ECardPadding.COMPACT]: "px-4 py-3",
  [ECardPadding.DEFAULT]: "p-4",
};

export const CARD_CLIP_CLASS = "overflow-hidden";

export const CARD_DEFAULTS = {
  SIZE: ECardSize.LG,
  PADDING: ECardPadding.DEFAULT,
  BACKGROUND: ECardBackground.DEFAULT,
} as const;
