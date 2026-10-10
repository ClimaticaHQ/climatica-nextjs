import type { ESeriesKind, ESeriesTitleSource } from "@/enums";
import type { TMonthlyTemperature } from "../domain";
import type { TDataState } from "./dataState.type";

/**
 * One monthly dataset a chart draws: a city, a climate period or a weather year. Every chart
 * page builds a list of these; the chart card derives everything else from it.
 */
export type TChartSeries = {
  /** stable key, also the data-update key: EWalterLiethSeriesId for a pair, the year for a weather year */
  id: string;
  kind: ESeriesKind;
  /** the series' name: city, period label or year */
  label: string;
  /** the second line under the name: dataset and period (cities) or the city (periods) */
  context: string;
  /** filled by the page from the current colour helpers */
  color: string;
  data: readonly TMonthlyTemperature[];
  altitude: number | null;
  /** the weather year when the data is one year, not long-term normals */
  year: number | null;
  state: TDataState;
};

/** The rules inherent to a series kind — never to a page or to how many series there are. */
export type TSeriesKindRule = {
  /** Walter-Lieth overlay: the reader picks which series is hatched */
  canShade: boolean;
  titleSource: ESeriesTitleSource;
  /** each series is one weather year: panels say "single year" */
  isSingleYear: boolean;
  /** overlay: chips above the chart name, toggle and highlight the series */
  hasSeriesChips: boolean;
  /** the standard chart draws a mean temperature line */
  hasMeanLine: boolean;
  /** the series' marker and overlay colour is its own (else the A / B identity colours) */
  usesOwnColor: boolean;
};
