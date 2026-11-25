import { useEffect, useState } from "react";

/** no draw-in on mount: ChartTransition already fades new content in */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return hasMounted;
}
