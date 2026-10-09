import { SPLIT_PANEL_CARD_CLASS } from "@/constants";

export const YEARS_BODY_CLASSES = {
  PANEL: SPLIT_PANEL_CARD_CLASS,
  // * an incomplete year's notice takes the panel's three tracks
  INCOMPLETE: "sm:row-span-3",
} as const;
