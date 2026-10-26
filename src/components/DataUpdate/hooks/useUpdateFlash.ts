import type { EUpdateFlashVariant } from "@/enums";
import { useMotionPreference } from "@/hooks/ui/useMotionPreference";
import type { TUpdateFlashKeys } from "@/types";
import { playUpdateFlash, shouldFlash } from "@/utils";
import { useEffect, useRef } from "react";
import { useDataUpdate } from "./useDataUpdate";

const INERT_SELECTOR = "[inert]";

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
