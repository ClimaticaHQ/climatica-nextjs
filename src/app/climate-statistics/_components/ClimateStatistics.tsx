"use client";

import { useCityClimatePage } from "@/hooks/pages/useCityClimatePage";
import { ClimateStatisticsView } from "./ClimateStatisticsView";

export function ClimateStatistics() {
  return <ClimateStatisticsView page={useCityClimatePage()} />;
}
