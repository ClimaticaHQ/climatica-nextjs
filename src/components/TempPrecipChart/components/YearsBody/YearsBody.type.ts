import type { ECompareLayout } from "@/enums";
import type {
  TActiveMonth,
  TPair,
  TVisibleSeries,
  TWalterLiethDomain,
  TWalterLiethSeriesInput,
  TYearOption,
} from "@/types";
import type { ReactNode } from "react";
import type { TTempPrecipChartProps, TTempPrecipChartState } from "../../TempPrecipChart.type";

export type TYearsBodyProps = {
  chartProps: TTempPrecipChartProps;
  chart: TTempPrecipChartState;
  /** one WL series per compared year */
  seriesYears: readonly TWalterLiethSeriesInput[];
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
  isWalterLieth: boolean;
  layout: ECompareLayout;
  syncId: string;
};

/** What every part of the years body gets: the years, the chart, the active month. */
export type TYearsBodyContext = TYearsBodyProps & {
  years: readonly TYearOption[];
  activeMonth: TActiveMonth;
};

export type TWalterLiethYearPanelProps = {
  series: TWalterLiethSeriesInput;
  domain: TWalterLiethDomain;
  syncId: string;
  activeMonth: TActiveMonth;
  /** in place of the year's name: the picker choosing it */
  name?: ReactNode;
};

export type TStandardYearPanelProps = {
  context: TYearsBodyContext;
  year: number;
  name?: ReactNode;
};

export type TYearPairBodyProps = {
  context: TYearsBodyContext;
  pair: TPair<number>;
};

export type TYearOverlayBodyProps = {
  context: TYearsBodyContext;
  shown: readonly number[];
  /** the hovered / focused year chip — the other years dim */
  highlighted: number | null;
};
