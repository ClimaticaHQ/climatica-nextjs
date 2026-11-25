import { WALTER_LIETH_COLORS } from "@/constants";

export const CHART_UNIT_TITLES = [
  { side: "left", text: "°C", color: WALTER_LIETH_COLORS.TEMP },
  { side: "right", text: "mm", color: WALTER_LIETH_COLORS.PREC },
] as const;
