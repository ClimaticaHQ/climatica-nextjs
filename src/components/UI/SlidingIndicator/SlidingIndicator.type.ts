import type { ESlidingIndicatorAxis } from "@/enums";
import type { TSlidingIndicatorState } from "@/types";

export type TSlidingIndicatorProps = {
  /** from useSlidingIndicator; null draws nothing (the item's static highlight shows) */
  indicator: TSlidingIndicatorState | null;
  axis: ESlidingIndicatorAxis;
  /** its look and its fixed sides (absolute, from the container's top left) */
  className: string;
  /** its transition (animations.css), applied only while it slides */
  motionClass: string;
};
