import { MONTH_TAP, WALTER_LIETH_DIAGRAM } from "@/constants";
import { getMonthAt, toggleMonth } from "@/utils";
import { useEffect, useRef, type PointerEvent } from "react";
import { MONTH_TAP_LAYER_CLASSES as C } from "./charts.constant";
import type { TMonthGesture, TMonthTapLayerProps } from "./charts.type";

/**
 * A touch plot's months, over the whole plot: a tap anywhere in a month's column selects it —
 * its tooltip opens — and the selection stays; a second tap on it, or a tap outside the plot,
 * clears it. A horizontal drag scrubs through the months while a vertical one still scrolls the
 * page (pan-y); a plot that scrolls sideways keeps its own drag, and takes taps only.
 */
export function MonthTapLayer({
  activeMonthIndex,
  onActiveMonthIndexChange,
  inset,
  canScrub,
  monthCount = WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR,
}: TMonthTapLayerProps) {
  const gesture = useRef<TMonthGesture | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const isSelected = activeMonthIndex !== null;

  // * a tap anywhere outside the plot closes the month (and its tooltip)
  useEffect(() => {
    if (!isSelected) return;
    const handleOutside = (event: globalThis.PointerEvent) => {
      const plot = layerRef.current?.parentElement;
      if (plot && event.target instanceof Node && !plot.contains(event.target)) {
        onActiveMonthIndexChange?.(null);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [isSelected, onActiveMonthIndexChange]);

  const monthAt = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return getMonthAt({ x: event.clientX - box.left, width: box.width, inset, monthCount });
  };

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    if (!start || !canScrub) return;
    const dx = Math.abs(event.clientX - start.x);
    if (!start.isScrubbing && dx < MONTH_TAP.MOVE_THRESHOLD) return;
    start.isScrubbing = true;
    const month = monthAt(event);
    if (month !== null) onActiveMonthIndexChange?.(month);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.isScrubbing) return;
    // * moved too far: the plot's own scroll, not a tap
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved >= MONTH_TAP.MOVE_THRESHOLD) return;
    const month = monthAt(event);
    if (month !== null) onActiveMonthIndexChange?.(toggleMonth(activeMonthIndex, month));
  }

  return (
    <div
      ref={layerRef}
      aria-hidden
      data-month-tap-layer
      className={canScrub ? C.SCRUB : C.TAP}
      onPointerDown={(event) => {
        gesture.current = { x: event.clientX, y: event.clientY, isScrubbing: false };
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      // * the browser took the gesture over (a vertical scroll)
      onPointerCancel={() => {
        gesture.current = null;
      }}
    />
  );
}
