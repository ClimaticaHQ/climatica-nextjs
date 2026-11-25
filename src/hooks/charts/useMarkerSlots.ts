import type { TMarkerSlots } from "@/types";
import { assignMarkerSlots } from "@/utils/seriesShape.util";
import { useState } from "react";

const isSameSlots = (a: TMarkerSlots, b: TMarkerSlots) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([key, slot]) => b[key] === slot);

export function useMarkerSlots(keys: readonly string[]) {
  const [saved, setSaved] = useState<TMarkerSlots>(() => assignMarkerSlots({}, keys));
  const slots = assignMarkerSlots(saved, keys);
  // * the slots are saved during render, intentionally, so the new list never draws with old markers
  if (!isSameSlots(saved, slots)) setSaved(slots);

  return {
    slots,
    restore: (restored: TMarkerSlots | null) => setSaved(assignMarkerSlots(restored ?? {}, keys)),
  };
}
