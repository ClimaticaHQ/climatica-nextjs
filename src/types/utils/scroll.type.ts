export type TScrollOptions = {
  offset?: number;
  toBottom?: boolean;
};

/** Whether content is hidden past a horizontal scroller's start / end. */
export type TScrollEdges = {
  isStartHidden: boolean;
  isEndHidden: boolean;
};

/** Where a scroll spy stands: its sections' tops and the scroller's position, all in px. */
export type TActiveSectionArgs = {
  /** each section's top in the scroller's content, in page order */
  tops: readonly number[];
  scrollTop: number;
  /** the scroller's largest scrollTop */
  maxScroll: number;
  /** how far below the scroller's top a section becomes current */
  line: number;
  /** px from the end that count as the end */
  endTolerance: number;
};
