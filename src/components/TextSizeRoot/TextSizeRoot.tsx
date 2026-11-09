"use client";

import { useTextSizeSync } from "@/hooks/ui/useTextSizeSync";

/** Keeps <html>'s --text-scale matching the text size setting. Renders nothing. */
export function TextSizeRoot() {
  useTextSizeSync();
  return null;
}
