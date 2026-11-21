import type { EBadgeSize } from "@/enums";
import type { TBadgeTone, TSeriesShape } from "@/types";
import type { ReactNode } from "react";

export type TBadgeProps = {
  tone: TBadgeTone;
  size?: EBadgeSize;
  /** an entity's shape before the content — e.g. a compared year's */
  markerShape?: TSeriesShape;
  /** one line, cut with an ellipsis when the badge is narrower than its content */
  isTruncated?: boolean;
  /** the full text on hover — for a truncated badge */
  title?: string;
  /**
   * a value still loading: the badge's own size (its content sets the width, drawn in the
   * skeleton colour like its fill), pulsing, hidden from screen readers
   */
  isPending?: boolean;
  children: ReactNode;
};
