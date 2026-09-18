"use client";

import { usePeriodsStore } from "@/stores";

export function usePersistedPeriods() {
  const { periods, setPeriods } = usePeriodsStore();
  return [periods, setPeriods] as const;
}
