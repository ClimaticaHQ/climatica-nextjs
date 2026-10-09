"use client";

import { LEGACY_FILTER_STORAGE_KEYS } from "@/constants";
import { useEffect } from "react";

/** Removes the filters older versions kept in localStorage — the URL holds them now. */
export function useLegacyFilterStorageCleanup() {
  useEffect(() => {
    try {
      LEGACY_FILTER_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // * storage blocked (private mode, disabled site data) — nothing was kept there either
    }
  }, []);
}
