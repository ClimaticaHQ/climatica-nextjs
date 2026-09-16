import type { TMonthlyTemperatureWithAvg } from "@/types";

export type TClimateDataTableProps = {
  monthlyData: TMonthlyTemperatureWithAvg[];
  activeMonthIndex: number | null;
};
