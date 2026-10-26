"use client";

import { TOUCH_MEDIA_QUERY } from "@/constants";
import { useMediaQuery } from "./useMediaQuery";

/** A touch device — no hover, a coarse pointer — whatever the screen's width. */
export function useIsTouch() {
  return useMediaQuery(TOUCH_MEDIA_QUERY);
}
