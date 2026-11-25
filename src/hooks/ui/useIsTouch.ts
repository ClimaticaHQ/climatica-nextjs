"use client";

import { TOUCH_MEDIA_QUERY } from "@/constants";
import { useMediaQuery } from "./useMediaQuery";

export function useIsTouch() {
  return useMediaQuery(TOUCH_MEDIA_QUERY);
}
