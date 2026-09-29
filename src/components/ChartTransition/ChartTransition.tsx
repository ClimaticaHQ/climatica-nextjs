import { MOTION } from "@/constants";
import { useMediaQuery } from "@/hooks";
import { useEffect, useState } from "react";
import { CHART_TRANSITION_CLASSES as C } from "./ChartTransition.constant";
import type { TChartTransitionProps, TTransitionLayer } from "./ChartTransition.type";
import { getEnterMotion } from "./ChartTransition.util";

/**
 * Crossfades a chart card's content when transitionKey changes: the old content fades out as
 * it last rendered while the new one fades in on top — or, with enterOrigin, scales up slightly
 * from that side (a split panel expanding). Instant under prefers-reduced-motion.
 */
export function ChartTransition({ transitionKey, enterOrigin, children }: TChartTransitionProps) {
  const isReducedMotion = useMediaQuery(MOTION.REDUCED_MOTION_QUERY);
  const [current, setCurrent] = useState<TTransitionLayer>({ key: transitionKey, node: children });
  const [leaving, setLeaving] = useState<TTransitionLayer | null>(null);

  /** Render-phase state update — intentional: the new content shows in this very render */
  if (current.key !== transitionKey) {
    setLeaving(isReducedMotion ? null : current);
    setCurrent({ key: transitionKey, node: children });
  } else if (current.node !== children) {
    setCurrent({ key: transitionKey, node: children });
  }

  const motion = getEnterMotion(enterOrigin);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), motion.durationMs);
    return () => clearTimeout(timer);
  }, [leaving, motion.durationMs]);

  const timing = { animationDuration: `${motion.durationMs}ms` };

  return (
    <div className={C.STACK}>
      {leaving && (
        <div
          key={leaving.key}
          aria-hidden
          inert
          className={`${C.LAYER} ${C.LEAVING}`}
          style={timing}
        >
          {leaving.node}
        </div>
      )}
      <div
        key={transitionKey}
        className={`${C.LAYER} ${leaving ? motion.className : ""}`}
        style={leaving ? { ...timing, ...motion.style } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
