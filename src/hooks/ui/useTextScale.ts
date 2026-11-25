"use client";

import { BASE_TEXT_SCALE } from "@/constants";
import { toTextScale } from "@/utils/textSize.util";
import { useSyncExternalStore } from "react";

const readTextScale = () => toTextScale(getComputedStyle(document.documentElement).fontSize);

// * only the text size setting moves the root size while the page is open
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  return () => observer.disconnect();
}

export function useTextScale() {
  return useSyncExternalStore(subscribe, readTextScale, () => BASE_TEXT_SCALE);
}
