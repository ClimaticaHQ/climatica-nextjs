import type { ECitySlot } from "@/enums";

export type TCitySlotRule = {
  /** the slots that take the same city when the reader syncs cities */
  syncsTo: readonly ECitySlot[];
  /** query key roots of the pages reading this slot */
  queryRoots: readonly string[];
};
