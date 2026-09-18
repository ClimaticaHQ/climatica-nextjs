import { useEffect, useState } from "react";

/**
 * Mirrors `hidden` immediately when it becomes false, but delays becoming true
 * by `delayMs` — lets an exit animation finish before the consumer (e.g. a
 * Recharts series) is actually hidden from rendering/tooltip/legend.
 *
 * `delayed` only ever flips to true from the setTimeout callback and is reset
 * in the effect's cleanup (not the effect body itself), so the returned value
 * — `hidden && delayed` — settles to false the instant `hidden` does, without
 * ever calling setState synchronously inside the effect body.
 */
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
