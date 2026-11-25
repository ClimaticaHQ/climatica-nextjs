import { useEffect, useState } from "react";

export function useDelayedHide(hidden: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!hidden) return;
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setDelayed(false);
    };
  }, [hidden, delayMs]);

  return hidden && delayed;
}
