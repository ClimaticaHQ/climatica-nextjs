import type { TBadgeTone } from "@/types";
import { CHIP_TONE_VARS } from "./Chip.constant";
import type { TChipToneStyle } from "./Chip.type";

/** A tint tone as the chip's custom properties, read by its state classes. */
export function getChipToneStyle(tone: TBadgeTone): TChipToneStyle {
  return {
    [CHIP_TONE_VARS.BG]: tone.bg,
    [CHIP_TONE_VARS.BORDER]: tone.border,
    [CHIP_TONE_VARS.TEXT]: tone.text,
  };
}
