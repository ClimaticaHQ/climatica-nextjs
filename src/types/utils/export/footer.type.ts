import type { EXPORT_SVG_SHARED_LAYOUT } from "@/constants";
import type { TDatasetAttribution } from "@/types";

export type TFooterTextLayout = Pick<
  typeof EXPORT_SVG_SHARED_LAYOUT,
  "width" | "paddingX" | "footerFontSize" | "footerUrlMinFontSize" | "footerUrlAvgCharWidthRatio"
>;

/** Font size varies per line — the share-URL line may shrink or wrap, the rest never do. */
export type TFooterTextLine = {
  text: string;
  fontSize: number;
};

/** Shared by every export builder — always at least 2 lines (brand, attribution) plus 1+ share-URL lines. */
export type TFooterLinesParams = {
  /** e.g. "Climate 1970–2000", "Lviv vs Madrid" — names the specific export's view. */
  contextLabel: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  layout: TFooterTextLayout;
};
