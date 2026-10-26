"use client";

import type { TAutoApplyOptions } from "@/types";
import { useEffect } from "react";
import { useDebounce } from "../ui/useDebounce";

/** Calls onApply once the key has stopped changing for delayMs, if shouldApply holds then. */
export function useAutoApply({ key, delayMs, shouldApply, onApply }: TAutoApplyOptions) {
  const debouncedKey = useDebounce(key, delayMs);

  useEffect(() => {
    if (shouldApply) onApply();
    // * only a settled key triggers it — shouldApply and onApply are read as they are then
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey]);
}
