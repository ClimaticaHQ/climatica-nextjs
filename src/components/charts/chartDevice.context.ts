import type { TChartDevice } from "@/types";
import { createContext } from "react";

// * from the chart card: a touch device (taps, no tooltips) and a phone's width (the narrow
// * axes); outside a card, neither
export const ChartDeviceContext = createContext<TChartDevice>({ isTouch: false, isNarrow: false });
