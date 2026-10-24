import type { TChartFocus } from "@/types";
import { createContext } from "react";

// * outside a standard overlay: no focus, nothing to focus
export const ChartFocusContext = createContext<TChartFocus | null>(null);
