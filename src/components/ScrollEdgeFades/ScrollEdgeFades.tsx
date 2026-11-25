import { SCROLL_EDGE_FADE_CLASSES as C } from "./ScrollEdgeFades.constant";
import type { TScrollEdgeFadesProps } from "./ScrollEdgeFades.type";

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
