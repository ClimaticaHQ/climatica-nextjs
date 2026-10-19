import {
  CARD_BACKGROUND_CLASSES,
  CARD_CLIP_CLASS,
  CARD_DEFAULTS,
  CARD_FLAT_BELOW_SM_CLASS,
  CARD_FRAME_CLASS,
  CARD_PADDING_CLASSES,
  CARD_SIZE_CLASSES,
} from "./Card.constant";
import type { TCardClassArgs } from "./Card.type";

/** The card's frame from its variants, then the caller's layout classes. */
export function getCardClassName({
  size = CARD_DEFAULTS.SIZE,
  padding = CARD_DEFAULTS.PADDING,
  background = CARD_DEFAULTS.BACKGROUND,
  shouldClip = false,
  isFlatBelowSm = false,
  className = "",
}: TCardClassArgs) {
  return [
    CARD_FRAME_CLASS,
    CARD_BACKGROUND_CLASSES[background],
    CARD_SIZE_CLASSES[size],
    CARD_PADDING_CLASSES[padding],
    shouldClip ? CARD_CLIP_CLASS : "",
    isFlatBelowSm ? CARD_FLAT_BELOW_SM_CLASS : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
