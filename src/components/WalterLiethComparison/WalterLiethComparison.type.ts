import type {
  TWalterLiethLayerSeries,
  TWalterLiethTooltipProps,
} from "@/components/WalterLiethChart/WalterLiethChart.type";
import type { EWalterLiethShading } from "@/enums";
import type {
  TActiveMonth,
  TPanelExpansion,
  TWalterLiethDomain,
  TWalterLiethRow,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
} from "@/types";

export type TSeriesPair = {
  seriesA: TWalterLiethSeries;
  seriesB: TWalterLiethSeries;
};

export type TShadingControlProps = TSeriesPair & {
  shading: EWalterLiethShading;
  onChange: (shading: EWalterLiethShading) => void;
};

export type TSplitViewProps = {
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
  domain: TWalterLiethDomain;
  syncId: string;
  expansion: TPanelExpansion;
  activeMonth: TActiveMonth;
};

export type TOverlayViewProps = TSeriesPair & {
  domain: TWalterLiethDomain;
  shading: EWalterLiethShading;
  activeMonth: TActiveMonth;
};

export type TOverlayLayerArgs = Omit<
  TWalterLiethLayerSeries,
  "colors" | "precDash" | "dotShape"
> & {
  series: TWalterLiethSeries;
  isShaded: boolean;
};

export type TOverlayTooltipProps = TWalterLiethTooltipProps &
  TSeriesPair & {
    rowsB: readonly TWalterLiethRow[];
  };
