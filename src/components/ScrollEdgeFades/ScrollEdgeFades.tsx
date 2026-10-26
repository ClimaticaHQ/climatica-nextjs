import { SCROLL_EDGE_FADE_CLASSES as C } from "./ScrollEdgeFades.constant";
import type { TScrollEdgeFadesProps } from "./ScrollEdgeFades.type";

/**
 * The faded ends of a horizontal scroller (edges from useScrollEdges) — inside a relative frame
 * around it. Decorative: the content itself stays reachable by scrolling.
 */
export function ScrollEdgeFades({ isStartHidden, isEndHidden, startInset }: TScrollEdgeFadesProps) {
  return (
    <>
      {isStartHidden && (
        <span
          className={`${C.FADE} ${C.START}`}
          style={startInset === undefined ? undefined : { left: startInset }}
          aria-hidden="true"
        />
      )}
      {isEndHidden && <span className={`${C.FADE} ${C.END}`} aria-hidden="true" />}
    </>
  );
}
