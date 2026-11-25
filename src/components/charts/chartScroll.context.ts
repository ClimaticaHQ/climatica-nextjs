import type { TChartScroll } from "@/types";
import { createContext } from "react";

export const ChartScrollContext = createContext<TChartScroll | null>(null);
