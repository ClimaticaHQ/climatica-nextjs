import type { TSegmentsFitArgs } from "@/types";

/**
 * Whether a segmented control's options fit inline: every label on one line beside its icon in an
 * equal share of the most room the control can take.
 */
export function getSegmentsFitInline({
  labelWidths,
  segmentExtra,
  availableWidth,
  trackExtra,
}: TSegmentsFitArgs) {
  const segmentWidth = (availableWidth - trackExtra) / labelWidths.length;
  return labelWidths.every((labelWidth) => labelWidth + segmentExtra <= segmentWidth);
}
