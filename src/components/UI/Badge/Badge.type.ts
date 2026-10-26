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
  children: ReactNode;
};
