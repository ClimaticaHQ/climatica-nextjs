export type TScrollOptions = {
  offset?: number;
  toBottom?: boolean;
};

export type TScrollEdges = {
  isStartHidden: boolean;
  isEndHidden: boolean;
};

export type TActiveSectionArgs = {
  tops: readonly number[];
  scrollTop: number;
  maxScroll: number;
  line: number;
  endTolerance: number;
};
