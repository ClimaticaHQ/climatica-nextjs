import { ETextScale } from "@/enums";

// * the app's small section label type — shared with labels that can't be uppercased (units)
export const SECTION_LABEL_TEXT = "text-xs font-semibold tracking-widest";

// * the label's size and tracking per text scale; TOUCH: 14 px, tracking ≤ 0.06em below lg
export const SECTION_LABEL_SCALE_CLASSES: Record<ETextScale, string> = {
  [ETextScale.DEFAULT]: SECTION_LABEL_TEXT,
  [ETextScale.TOUCH]: `${SECTION_LABEL_TEXT} max-lg:text-[length:var(--font-touch-label)] max-lg:tracking-[var(--touch-label-tracking)]`,
};
