import type { TClimatePeriod } from "@/types";

export type TClimatePeriodsState = {
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  setClimatePeriodA: (period: TClimatePeriod) => void;
  setClimatePeriodB: (period: TClimatePeriod) => void;
};
