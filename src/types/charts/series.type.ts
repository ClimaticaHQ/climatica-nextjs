import type { ESeriesKind, ESeriesTitleSource } from "@/enums";
import type { TMonthlyTemperature } from "../domain";
import type { TDataState } from "./dataState.type";
import type { TSeriesHatch, TSeriesShape } from "./seriesShape.type";

export type TChartSeries = {
  id: string;
  kind: ESeriesKind;
  label: string;
  context: string;
  markerSlot: number;
  /** entities are told apart by shape, never by colour (a protected convention) */
  shape: TSeriesShape;
  hatch: TSeriesHatch;
  data: readonly TMonthlyTemperature[];
  altitude: number | null;
  year: number | null;
  state: TDataState;
};

export type TSeriesKindRule = {
  canShade: boolean;
  titleSource: ESeriesTitleSource;
  isSingleYear: boolean;
  hasSeriesChips: boolean;
  hasMeanLine: boolean;
};

export type TEntityLabelSource = {
  kind: ESeriesKind;
  label: string;
};
