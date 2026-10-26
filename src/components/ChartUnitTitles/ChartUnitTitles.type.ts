export type TChartUnitTitlesProps = {
  /** one panel of a split pair — the compact margins and text */
  isCompact: boolean;
  /** a phone's full-width chart: the narrow axes */
  isNarrow?: boolean;
  /** only this side's title — a fixed axis of a scrolling plot; both when omitted */
  side?: "left" | "right";
};
