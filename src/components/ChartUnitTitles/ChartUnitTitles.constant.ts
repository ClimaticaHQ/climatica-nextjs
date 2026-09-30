import { WALTER_LIETH_COLORS } from "@/constants";

// * °C in the WL temperature red, mm in its precipitation blue — in every chart type
export const CHART_UNIT_TITLES = [
  { side: "left", text: "°C", color: WALTER_LIETH_COLORS.TEMP },
  { side: "right", text: "mm", color: WALTER_LIETH_COLORS.PREC },
] as const;
