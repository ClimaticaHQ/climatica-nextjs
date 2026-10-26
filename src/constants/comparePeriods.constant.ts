import { ESortOrder } from "@/enums";
export const MIN_PERIODS = 2;
export const MAX_PERIODS = 5;

// * Compare Periods lists its years / periods oldest first unless the reader flips it
export const DEFAULT_SORT_ORDER = ESortOrder.ASC;
// * a marker slot in the URL: "year:slot", comma-joined
export const MARKER_SLOT_SEPARATOR = ":";
