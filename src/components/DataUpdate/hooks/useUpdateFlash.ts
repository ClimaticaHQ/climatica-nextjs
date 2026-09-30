import {
  MOTION,
  UPDATE_FLASH_ACTIVE,
  UPDATE_FLASH_ATTRIBUTE,
  UPDATE_FLASH_TOKENS,
  UPDATE_FLASH_VARIANT_ATTRIBUTE,
} from "@/constants";
import type { EUpdateFlashVariant } from "@/enums";
import { useMotionPreference } from "@/hooks";
import type { TUpdateFlashKeys } from "@/types";
import { getUpdateFlashKeyframe, shouldFlash } from "@/utils";
import { useEffect, useRef } from "react";
import { useDataUpdate } from "./useDataUpdate";

const INERT_SELECTOR = "[inert]";

function playUpdateFlash(element: HTMLElement, variant: EUpdateFlashVariant) {
  const style = getComputedStyle(element);
  const keyframe = getUpdateFlashKeyframe({
    border: style.getPropertyValue(UPDATE_FLASH_TOKENS.BORDER).trim(),
    glow: style.getPropertyValue(UPDATE_FLASH_TOKENS.GLOW).trim(),
    variant,
  });
  element.dataset[UPDATE_FLASH_ATTRIBUTE] = UPDATE_FLASH_ACTIVE;
  element.dataset[UPDATE_FLASH_VARIANT_ATTRIBUTE] = variant;
  // * from the flash colors back to the card's own border and shadow
  const animation = element.animate([keyframe], {
    duration: MOTION.UPDATE_FLASH_MS,
    easing: MOTION.UPDATE_FLASH_EASING,
  });
  const end = () => {
    delete element.dataset[UPDATE_FLASH_ATTRIBUTE];
    delete element.dataset[UPDATE_FLASH_VARIANT_ATTRIBUTE];
  };
  animation.onfinish = end;
  animation.oncancel = end;
}

/**
 * A card's update flash: put the ref on the bordered element. It flashes when a fresh update
 * changed one of the card's series — also right after the update's crossfade remounted it,
 * never on the first load or a chart type / layout switch. None with motion off. The
 * variant (glow or border only) is read when the flash starts.
 */
export function useUpdateFlash<T extends HTMLElement>(
  keys: TUpdateFlashKeys,
  variant: EUpdateFlashVariant,
) {
  const ref = useRef<T>(null);
  const handledIdRef = useRef<number | null>(null);
  const { update, isFresh } = useDataUpdate();
  const { isMotionEnabled } = useMotionPreference();

  useEffect(() => {
    const isDue = shouldFlash({
      update,
      isFresh: isFresh(update.id),
      handledId: handledIdRef.current,
      keys,
    });
    handledIdRef.current = update.id;
    // * not the crossfade's outgoing copy (inert) — only the card that stays
    const element = ref.current;
    if (isDue && isMotionEnabled && element && !element.closest(INERT_SELECTOR)) {
      playUpdateFlash(element, variant);
    }
  }, [update, isFresh, keys, isMotionEnabled, variant]);

  return ref;
}
