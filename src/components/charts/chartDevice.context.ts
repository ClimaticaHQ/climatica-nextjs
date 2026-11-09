import { BASE_TEXT_SCALE } from "@/constants";
import type { TChartDevice } from "@/types";
import { createContext } from "react";

// * from the chart card: a touch device (taps, no tooltips), a phone's width (the narrow axes)
// * and the text scale; outside a card, none of them
export const ChartDeviceContext = createContext<TChartDevice>({
  isTouch: false,
  isNarrow: false,
  textScale: BASE_TEXT_SCALE,
});
