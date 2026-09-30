"use client";

import { useClimatePeriodsStore } from "@/stores";

export function usePersistedClimatePeriods() {
  const { climatePeriodA, climatePeriodB, setClimatePeriodA, setClimatePeriodB } =
    useClimatePeriodsStore();
  return { climatePeriodA, climatePeriodB, setClimatePeriodA, setClimatePeriodB };
}
