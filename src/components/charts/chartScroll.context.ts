import type { TChartScroll } from "@/types";
import { createContext } from "react";

// * outside an overflowing overlay: nothing scrolls, tables keep their own width
export const ChartScrollContext = createContext<TChartScroll | null>(null);
