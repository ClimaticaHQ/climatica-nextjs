import type { TLocationSearchProps } from "@/components/LocationSearch/LocationSearch.type";
import type { ECompareLayout, ESortOrder, EWalterLiethShading } from "@/enums";
import type {
  TChartMode,
  TChartPageResult,
  TCity,
  TExpandedPanel,
  TMarkerSlots,
  TPair,
  TValuePair,
} from "@/types";

export type TComparePeriodsUrlState = {
  city: TCity;
  layout: ECompareLayout;
  wlShading: EWalterLiethShading;
  chartMode: TChartMode;
  expanded: TExpandedPanel;
  yearPair: TPair<number> | null;
  shownYears: readonly number[] | null;
  sortOrder: ESortOrder;
  markerSlots: TMarkerSlots | null;
};

export type TPeriodCitySearchProps = TLocationSearchProps & {
  city: TCity;
};

export type TPeriodTrend = {
  tmax: TValuePair;
  prec: TValuePair;
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
