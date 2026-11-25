"use client";

import { useTextSizeSync } from "@/hooks/ui/useTextSizeSync";

export function TextSizeRoot() {
  useTextSizeSync();
  return null;
}
