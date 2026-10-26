import type { WEATHER_VARIABLES } from "@/constants";
import type { TCellSize, TClimatePeriod, TDataset, TVariable } from "@/types";

export type TCsvVariable = (typeof WEATHER_VARIABLES)[number];

/** Covers every SCRAPI variable, not just tmax/tmin/prec. */
export type TFullVariableMonthRow = {
  month: number;
  monthName: string;
} & Partial<Record<TVariable, number>>;

/** Populated only when the user triggers the raw CSV/JSON export. */
export type TExportRawData = {
  rows: TFullVariableMonthRow[];
  variables: readonly TVariable[];
};

export type TRawJsonExport = {
  city: string;
  coordinates: { lat: number; lng: number };
  altitude: number | null;
  gridSize: TCellSize;
  dataset: TDataset | null;
  climatePeriod: TClimatePeriod | null;
  weatherYear: number | null;
  variables: readonly TVariable[];
  monthly: TFullVariableMonthRow[];
};
