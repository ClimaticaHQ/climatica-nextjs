import type {
  TCellSize,
  TChartSubtitle,
  TComparisonTable,
  TCoordinates,
  TDatasetAttribution,
} from "@/types";
import type { TVisibleSeries } from "../components";
import type { TChartModel } from "./chartModel.type";
import type { TChartFeatures, TChartViewState } from "./chartPage.type";

export type TChartExportPlace = TCoordinates & {
  name: string;
};

export type TUseSingleChartExportArgs = {
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  visible: TVisibleSeries | null;
  fileStem: string;
  place: TChartExportPlace;
  gridSize: TCellSize;
  subtitle: TChartSubtitle;
  periodLabel: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  isFetching: boolean;
};

export type TUseSingleExportLabelsArgs = Pick<
  TUseSingleChartExportArgs,
  "subtitle" | "periodLabel"
> & {
  placeName: string;
  martonne: number | null;
};

export type TUseComparisonChartExportArgs = Pick<
  TUseSingleChartExportArgs,
  | "model"
  | "viewState"
  | "features"
  | "visible"
  | "fileStem"
  | "datasetAttribution"
  | "shareUrl"
  | "isFetching"
>;

export type TUseComparisonExportBlockArgs = Pick<
  TUseSingleChartExportArgs,
  "model" | "viewState"
> & {
  table: TComparisonTable | null;
  visible: TVisibleSeries;
};

export type TUseYearsExportBlockArgs = Pick<TUseSingleChartExportArgs, "model" | "viewState"> & {
  drawn: readonly number[];
};
