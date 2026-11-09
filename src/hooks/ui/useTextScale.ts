"use client";

import { BASE_TEXT_SCALE } from "@/constants";
import { toTextScale } from "@/utils/textSize.util";
import { useSyncExternalStore } from "react";

const readTextScale = () => toTextScale(getComputedStyle(document.documentElement).fontSize);

// * the text size setting changes <html>'s style (--text-scale); nothing else moves the root size
// * while the page is open
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  return () => observer.disconnect();
}

/**
 * The effective text scale (the root font size / 16): the browser's default size and the app's
 * text size together. On-screen charts multiply their px sizes by it; exports never read it.
 * 1 on the server, so the first client render matches it.
 */
export function useTextScale() {
  return useSyncExternalStore(subscribe, readTextScale, () => BASE_TEXT_SCALE);
}
