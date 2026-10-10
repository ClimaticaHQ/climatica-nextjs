import type { ECitySlot } from "@/enums";
import type { RefObject } from "react";
import type { TChartMode } from "../components";
import type { TCity } from "../domain";
import type { TScrollOptions } from "../utils";

export type TUseScrollToResultsArgs = {
  /** what to scroll to — the results' section */
  targetRef: RefObject<HTMLElement | null>;
  /** the data shown; a change after a pick scrolls once it's there */
  results: unknown;
  hasResults: boolean;
  /** where the results land in the view (City Climate: near the top, the others: the bottom) */
  scrollOptions: TScrollOptions;
};

export type TUseCitySelectionArgs = {
  /** the persisted city this pick goes to */
  slot: ECitySlot;
  /** after the slots are set: the page's own follow-up (URL state, the map's target) */
  onPicked?: (city: TCity) => void;
};

export type TUseWeatherYearsViewStateArgs = {
  /** every compared year, in order */
  years: readonly number[];
  isWeather: boolean;
  chartMode: TChartMode;
};
