import { getIndicatorStyle } from "@/utils/slidingIndicator.util";
import type { TSlidingIndicatorProps } from "./SlidingIndicator.type";

/** One decorative element under a list's active item, sliding to the next (useSlidingIndicator). */
export function SlidingIndicator({
  indicator,
  axis,
  className,
  motionClass,
}: TSlidingIndicatorProps) {
  if (!indicator) return null;
  return (
    <span
      aria-hidden
      data-sliding-indicator
      className={`${className} ${indicator.isAnimated ? motionClass : ""}`}
      style={getIndicatorStyle({ rect: indicator, axis })}
    />
  );
}
