import type { TMonthlyTemperatureWithAvg } from "@/types";

export type TClimateDataTableProps = {
  monthlyData: TMonthlyTemperatureWithAvg[];
  activeMonthIndex: number | null;
  onMonthHover?: (index: number | null) => void;
};
