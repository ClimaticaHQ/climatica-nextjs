import type { TLocationSearchProps } from "@/components/LocationSearch/LocationSearch.type";
import type { ECompareLayout, ESortOrder, EWalterLiethShading } from "@/enums";
import type {
  TChartMode,
  TChartPageResult,
  TCity,
  TExpandedPanel,
  TMarkerSlots,
  TPair,
} from "@/types";

export type TComparePeriodsUrlState = {
  city: TCity;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
  /** weather years, side by side: the two drawn — null for the first two, the default */
  yearPair: TPair<number> | null;
  /** weather years, overlay: the years drawn — null for all of them, the default */
  shownYears: readonly number[] | null;
  /** the order every list of the page follows, by year */
  sortOrder: ESortOrder;
  /** weather years: each one's marker slot — null when it's the list's order, the default */
  markerSlots: TMarkerSlots | null;
};

/** The city search with its period-coloured label, and the mini map. */
export type TPeriodCitySearchProps = TLocationSearchProps & {
  city: TCity;
};

/** The trend cards under a climate comparison: how temperature and precipitation changed. */
export type TPeriodTrend = {
  /** later minus earlier, °C; 0: no change */
  tmaxDiff: number;
  /** later minus earlier, mm */
  precDiff: number;
  labelA: string;
  labelB: string;
};

export type TPeriodTrendCardsProps = {
  trend: TPeriodTrend | null;
};

export type TComparePeriodsPage = TChartPageResult<null, TPeriodTrend | null> & {
  search: TPeriodCitySearchProps;
};

export type TComparePeriodsViewProps = {
  page: TComparePeriodsPage;
};
