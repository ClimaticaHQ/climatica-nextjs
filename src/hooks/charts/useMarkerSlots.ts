import type { TMarkerSlots } from "@/types";
import { assignMarkerSlots } from "@/utils/seriesShape.util";
import { useState } from "react";

const isSameSlots = (a: TMarkerSlots, b: TMarkerSlots) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([key, slot]) => b[key] === slot);

/**
 * Each entity's marker slot, kept while the list changes (assignMarkerSlots): a year keeps its
 * marker whatever the order, a removed one frees its slot for the next added. `restore` takes
 * the slots a URL carries (none: the list's order).
 */
export function useMarkerSlots(keys: readonly string[]) {
  const [saved, setSaved] = useState<TMarkerSlots>(() => assignMarkerSlots({}, keys));
  const slots = assignMarkerSlots(saved, keys);
  // * the list changed: the new slots become the saved ones, during this render
  if (!isSameSlots(saved, slots)) setSaved(slots);

  return {
    slots,
    restore: (restored: TMarkerSlots | null) => setSaved(assignMarkerSlots(restored ?? {}, keys)),
  };
}
