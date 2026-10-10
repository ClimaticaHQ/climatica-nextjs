"use client";

import { useHeatMapPage } from "@/hooks/pages/useHeatMapPage";
import { HeatMapView } from "./HeatMapView";

export function HeatMap() {
  return <HeatMapView page={useHeatMapPage()} />;
}
