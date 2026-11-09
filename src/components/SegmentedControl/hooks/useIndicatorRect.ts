import { useEffect, useRef, useState } from "react";
import type { TIndicatorRect } from "../SegmentedControl.type";

/**
 * The active option's box inside the track — measured from the pressed button, again when the
 * value changes and whenever the track resizes (window resize, icon-only below `sm`, labels, the list layout).
 */
export function useIndicatorRect(value: string) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<TIndicatorRect | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const active = track.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!active) return;
      setRect({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      });
    };
    // * next frame: the pressed state is committed and laid out by then
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value]);

  return { trackRef, rect };
}
