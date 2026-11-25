import type { ECitySlot } from "@/enums";
import type { RefObject } from "react";
import type { TChartMode } from "../components";
import type { TCity } from "../domain";
import type { TScrollOptions } from "../utils";

export type TUseScrollToResultsArgs = {
  targetRef: RefObject<HTMLElement | null>;
  results: unknown;
  hasResults: boolean;
  scrollOptions: TScrollOptions;
};

export type TUseCitySelectionArgs = {
  slot: ECitySlot;
  onPicked?: (city: TCity) => void;
};

export type TUseWeatherYearsViewStateArgs = {
  years: readonly number[];
  isWeather: boolean;
  chartMode: TChartMode;
};
