"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import { create } from "zustand";

type TPeriodsState = {
  periods: number[];
  setPeriods: (years: number[]) => void;
};

function defaultPeriods(): number[] {
  return [2021, 1967];
}

function loadPeriods(): number[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.COMPARE_PERIODS);
    if (!raw) return defaultPeriods();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultPeriods();
    const years = parsed.filter((v): v is number => typeof v === "number");
    return years.length >= 2 ? years : defaultPeriods();
  } catch {
    return defaultPeriods();
  }
}

function savePeriods(years: number[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COMPARE_PERIODS, JSON.stringify(years));
  } catch {
    return;
  }
}

const periodsStore = create<TPeriodsState>()((set) => ({
  periods: loadPeriods(),
  setPeriods: (years) => {
    set({ periods: years });
    savePeriods(years);
  },
}));

export function usePersistedPeriods() {
  const { periods, setPeriods } = periodsStore();
  return [periods, setPeriods] as const;
}
