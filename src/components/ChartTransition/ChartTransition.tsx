import { useMotionPreference } from "@/hooks";
import { useEffect, useState } from "react";
import { CHART_TRANSITION_CLASSES as C } from "./ChartTransition.constant";
import type { TChartTransitionProps, TTransitionLayer } from "./ChartTransition.type";
import { getTransitionMotion } from "./ChartTransition.util";

/**
 * Crossfades a chart card's content when transitionKey changes: the old content fades out as
 * it last rendered while the new one fades in on top — or, with enterOrigin, scales up slightly
 * from that side (a split panel expanding). A placeholder (the content while its data load) is
 * replaced, not crossfaded: under the same key the layer stays (nothing in it remounts) and
 * fades in as the content arrives; under a new key it goes at once. Instant with motion off
 * (setting or reduced motion).
 */
export function ChartTransition({
  transitionKey,
  enterOrigin,
  isPlaceholder = false,
  children,
}: TChartTransitionProps) {
  const { isMotionEnabled } = useMotionPreference();
  const [current, setCurrent] = useState<TTransitionLayer>({
    key: transitionKey,
    node: children,
    isPlaceholder,
  });
  const [leaving, setLeaving] = useState<TTransitionLayer | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  /** Render-phase state update — intentional: the new content shows in this very render */
  if (current.key !== transitionKey) {
    setLeaving(isMotionEnabled && !current.isPlaceholder ? current : null);
    setIsEntering(isMotionEnabled);
    setCurrent({ key: transitionKey, node: children, isPlaceholder });
  } else if (current.node !== children || current.isPlaceholder !== isPlaceholder) {
    if (current.isPlaceholder && !isPlaceholder) setIsEntering(isMotionEnabled);
    setCurrent({ key: transitionKey, node: children, isPlaceholder });
  }

  const motion = getTransitionMotion(enterOrigin);

  useEffect(() => {
    if (!isEntering) return;
    const timer = setTimeout(() => {
      setLeaving(null);
      setIsEntering(false);
    }, motion.durationMs);
    return () => clearTimeout(timer);
  }, [isEntering, current.key, motion.durationMs]);

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
      <div key={transitionKey} className={`${C.LAYER} ${isEntering ? motion.enterClassName : ""}`}>
        {children}
      </div>
    </div>
  );
}
