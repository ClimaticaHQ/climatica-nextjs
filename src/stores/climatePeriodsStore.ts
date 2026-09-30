"use client";

import { CLIMATE_PERIODS, LOCAL_STORAGE_KEYS } from "@/constants";
import type { TClimatePeriod, TClimatePeriodsState } from "@/types";
import { create } from "zustand";

function defaultPeriods(): [TClimatePeriod, TClimatePeriod] {
  return [CLIMATE_PERIODS.C1970_2000, CLIMATE_PERIODS.C1991_2020];
}

function isClimatePeriod(value: unknown): value is TClimatePeriod {
  return typeof value === "string" && (Object.values(CLIMATE_PERIODS) as string[]).includes(value);
}

function loadPeriods(): [TClimatePeriod, TClimatePeriod] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPARE_CLIMATE_PERIODS);
    if (!raw) return defaultPeriods();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 2) return defaultPeriods();
    const [a, b] = parsed;
    return isClimatePeriod(a) && isClimatePeriod(b) ? [a, b] : defaultPeriods();
  } catch {
    return defaultPeriods();
  }
}

function savePeriods(periodA: TClimatePeriod, periodB: TClimatePeriod) {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.COMPARE_CLIMATE_PERIODS,
      JSON.stringify([periodA, periodB]),
    );
  } catch {
    return;
  }
}

const [initialPeriodA, initialPeriodB] = loadPeriods();

export const useClimatePeriodsStore = create<TClimatePeriodsState>()((set, get) => ({
  climatePeriodA: initialPeriodA,
  climatePeriodB: initialPeriodB,
  setClimatePeriodA: (period) => {
    set({ climatePeriodA: period });
    savePeriods(period, get().climatePeriodB);
  },
  setClimatePeriodB: (period) => {
    set({ climatePeriodB: period });
    savePeriods(get().climatePeriodA, period);
  },
}));
