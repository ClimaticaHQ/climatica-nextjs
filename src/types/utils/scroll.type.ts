export type TScrollOptions = {
  offset?: number;
  toBottom?: boolean;
};

/** Whether content is hidden past a horizontal scroller's start / end. */
export type TScrollEdges = {
  isStartHidden: boolean;
  isEndHidden: boolean;
};
