/** What decides whether a segmented control's options fit inline, in px. */
export type TSegmentsFitArgs = {
  /** each label's width on one line */
  labelWidths: readonly number[];
  /** a segment's width beyond its label: icon, gap, padding */
  segmentExtra: number;
  /** the most room the control can take */
  availableWidth: number;
  /** the track's width beyond its segments: padding, gaps */
  trackExtra: number;
};
