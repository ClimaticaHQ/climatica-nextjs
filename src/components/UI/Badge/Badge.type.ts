import type { EBadgeSize } from "@/enums";
import type { TBadgeTone, TSeriesShape } from "@/types";
import type { ReactNode } from "react";

export type TBadgeProps = {
  tone: TBadgeTone;
  size?: EBadgeSize;
  markerShape?: TSeriesShape;
  isTruncated?: boolean;
  title?: string;
  isPending?: boolean;
  children: ReactNode;
};
