import type { ECitySlot } from "@/enums";

export type TCitySlotRule = {
  syncsTo: readonly ECitySlot[];
  queryRoots: readonly string[];
};
