"use client";

import { useThemeSync } from "@/hooks/ui/useThemeSync";

export function ThemeRoot() {
  useThemeSync();
  return null;
}
