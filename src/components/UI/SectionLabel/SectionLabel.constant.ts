import { ETextScale } from "@/enums";

export const SECTION_LABEL_TEXT =
  "text-[length:var(--font-xs)] leading-[var(--leading-xs)] font-semibold tracking-widest";

export const SECTION_LABEL_SCALE_CLASSES: Record<ETextScale, string> = {
  [ETextScale.DEFAULT]: SECTION_LABEL_TEXT,
  [ETextScale.TOUCH]: `${SECTION_LABEL_TEXT} max-lg:text-[length:var(--font-touch-label)] max-lg:tracking-[var(--touch-label-tracking)]`,
};
