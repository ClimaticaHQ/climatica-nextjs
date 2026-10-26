import { ECitySlot } from "@/enums";
import type { TCitySlotRule } from "@/types";

/**
 * What picking a city into each slot does when the reader syncs cities: the slots that follow
 * it, and the query roots of the pages that read a slot — refetched when the slot changes.
 */
export const CITY_SLOT_RULES = {
  [ECitySlot.CITY]: {
    syncsTo: [ECitySlot.COMPARISON_A],
    queryRoots: ["climate", "compare-periods"],
  },
  [ECitySlot.COMPARISON_A]: { syncsTo: [ECitySlot.CITY], queryRoots: ["compare"] },
  [ECitySlot.COMPARISON_B]: { syncsTo: [], queryRoots: ["compare"] },
  [ECitySlot.MAP]: { syncsTo: [ECitySlot.CITY, ECitySlot.COMPARISON_A], queryRoots: [] },
} as const satisfies Record<ECitySlot, TCitySlotRule>;
