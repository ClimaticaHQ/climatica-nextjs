import type { TCellSize, TClimatePeriod } from "@/types";

export type TFetchFullClimateDataParams = {
  lat: number;
  lng: number;
  gridSize: TCellSize;
  climatePeriod: TClimatePeriod;
};
