import type { ESlidingIndicatorAxis } from "@/enums";
import type { TSlidingIndicatorState } from "@/types";

export type TSlidingIndicatorProps = {
  indicator: TSlidingIndicatorState | null;
  axis: ESlidingIndicatorAxis;
  className: string;
  motionClass: string;
};
