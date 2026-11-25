import type { EXPORT_SVG_SHARED_LAYOUT } from "@/constants";
import type { TDatasetAttribution } from "@/types";

export type TFooterTextLayout = Pick<
  typeof EXPORT_SVG_SHARED_LAYOUT,
  "width" | "paddingX" | "footerFontSize" | "footerUrlMinFontSize" | "footerUrlAvgCharWidthRatio"
>;

export type TFooterTextLine = {
  text: string;
  fontSize: number;
};

export type TFooterLinesParams = {
  contextLabel: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  layout: TFooterTextLayout;
};
