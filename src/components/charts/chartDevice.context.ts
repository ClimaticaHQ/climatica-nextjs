import { BASE_TEXT_SCALE } from "@/constants";
import type { TChartDevice } from "@/types";
import { createContext } from "react";

export const ChartDeviceContext = createContext<TChartDevice>({
  isTouch: false,
  isNarrow: false,
  textScale: BASE_TEXT_SCALE,
});
