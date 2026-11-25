import type { TSegmentsFitArgs } from "@/types";

export function getSegmentsFitInline({
  labelWidths,
  segmentExtra,
  availableWidth,
  trackExtra,
}: TSegmentsFitArgs) {
  const segmentWidth = (availableWidth - trackExtra) / labelWidths.length;
  return labelWidths.every((labelWidth) => labelWidth + segmentExtra <= segmentWidth);
}
