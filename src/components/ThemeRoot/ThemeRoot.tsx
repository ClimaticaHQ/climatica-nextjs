"use client";

import { useThemeSync } from "@/hooks/ui/useThemeSync";

/** Keeps <html>'s dark class matching the theme setting (and the device, with system). Renders nothing. */
export function ThemeRoot() {
  useThemeSync();
  return null;
}
