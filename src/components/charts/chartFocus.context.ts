import type { TChartFocus } from "@/types";
import { createContext } from "react";

export const ChartFocusContext = createContext<TChartFocus | null>(null);
