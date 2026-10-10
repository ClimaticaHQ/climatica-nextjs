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

/** The exported place: its name in the title and the file name, its coordinates in the footer. */
export type TChartExportPlace = TCoordinates & {
  name: string;
};

export type TUseSingleChartExportArgs = {
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  /** the chart's variable chips; null until the chart reports them */
  visible: TVisibleSeries | null;
  /** the file names' first part, e.g. "city-climate" */
  fileStem: string;
  place: TChartExportPlace;
  gridSize: TCellSize;
  subtitle: TChartSubtitle;
  /** the dataset / period line, as on screen */
  periodLabel: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  /** a refetch in progress: exporting now would save the data being replaced */
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
  /** the years the screen draws: the side-by-side pair, or the overlay's shown years */
  drawn: readonly number[];
};
