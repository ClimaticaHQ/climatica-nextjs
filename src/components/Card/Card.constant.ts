import { ECardBackground, ECardElevation, ECardPadding, ECardSize } from "@/enums";

export const CARD_FRAME_CLASS = "border border-[var(--color-border)]";

export const CARD_BACKGROUND_CLASSES: Record<ECardBackground, string> = {
  [ECardBackground.DEFAULT]: "bg-[var(--color-bg)]",
  [ECardBackground.MUTED]: "bg-[var(--color-bg-secondary)]",
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

export const CARD_ELEVATION_CLASSES: Record<ECardElevation, string> = {
  [ECardElevation.FLAT]: "",
  [ECardElevation.RAISED]: "shadow-[var(--shadow-md)]",
};

export const CARD_CLIP_CLASS = "overflow-hidden";

export const CARD_FLAT_BELOW_SM_CLASS =
  "max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none";

export const CARD_DEFAULTS = {
  SIZE: ECardSize.LG,
  PADDING: ECardPadding.DEFAULT,
  ELEVATION: ECardElevation.FLAT,
  BACKGROUND: ECardBackground.DEFAULT,
} as const;
