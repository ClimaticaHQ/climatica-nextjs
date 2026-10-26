import { useEffect, useState } from "react";

/**
 * False on the first render, true from the next frame on. Charts pass it to Recharts'
 * isAnimationActive: no draw-in on mount — ChartTransition already fades new content in —
 * while later changes (toggling a variable) still animate.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return hasMounted;
}
