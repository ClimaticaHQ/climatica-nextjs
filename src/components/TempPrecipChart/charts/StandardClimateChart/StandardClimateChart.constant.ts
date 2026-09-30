import { CHART_COLORS } from "../../TempPrecipChart.constant";
import type { TStandardChartColors } from "./StandardClimateChart.type";

// * the single-city chart: red/blue/orange lines, humid bars (arid months recolored)
export const STANDARD_CHART_SINGLE_COLORS: TStandardChartColors = {
  ...CHART_COLORS.single,
  prec: CHART_COLORS.humid,
};
