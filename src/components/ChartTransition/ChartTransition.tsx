import { useMotionPreference } from "@/hooks";
import { useEffect, useState } from "react";
import { CHART_TRANSITION_CLASSES as C } from "./ChartTransition.constant";
import type { TChartTransitionProps, TTransitionLayer } from "./ChartTransition.type";
import { getTransitionMotion } from "./ChartTransition.util";

/**
 * Crossfades a chart card's content when transitionKey changes: the old content fades out as
 * it last rendered while the new one fades in on top — or, with enterOrigin, scales up slightly
 * from that side (a split panel expanding). Instant with motion off (setting or reduced motion).
 */
export function ChartTransition({ transitionKey, enterOrigin, children }: TChartTransitionProps) {
  const { isMotionEnabled } = useMotionPreference();
  const [current, setCurrent] = useState<TTransitionLayer>({ key: transitionKey, node: children });
  const [leaving, setLeaving] = useState<TTransitionLayer | null>(null);

  /** Render-phase state update — intentional: the new content shows in this very render */
  if (current.key !== transitionKey) {
    setLeaving(isMotionEnabled ? current : null);
    setCurrent({ key: transitionKey, node: children });
  } else if (current.node !== children) {
    setCurrent({ key: transitionKey, node: children });
  }

  const motion = getTransitionMotion(enterOrigin);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => setLeaving(null), motion.durationMs);
    return () => clearTimeout(timer);
  }, [leaving, motion.durationMs]);

  return (
    <div className={C.STACK}>
      {leaving && (
        <div
          key={leaving.key}
          aria-hidden
          inert
          className={`${C.LAYER} ${C.LEAVING} ${motion.leaveClassName}`}
        >
          {leaving.node}
        </div>
      )}
      <div key={transitionKey} className={`${C.LAYER} ${leaving ? motion.enterClassName : ""}`}>
        {children}
      </div>
    </div>
  );
}
