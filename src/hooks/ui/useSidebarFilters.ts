import { CLIMATE_RANGE } from "@/constants/climate.constant";

export function buildPeriodWindowOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let start = CLIMATE_RANGE.MIN_START; start <= CLIMATE_RANGE.MAX_START; start += 10) {
    options.push({ value: String(start), label: `${start}–${start + CLIMATE_RANGE.WINDOW}` });
  }
  return options;
}

export const PERIOD_WINDOW_OPTIONS = buildPeriodWindowOptions();
