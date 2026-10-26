import { EPairLayoutVariant } from "@/enums";
import type { TPairLayoutClasses } from "./PairLayout.type";

export const PAIR_LAYOUT_CLASSES = {
  [EPairLayoutVariant.ROW]: {
    ROOT: "flex items-end gap-2",
    ROOT_WITH_BETWEEN: "flex items-end gap-2",
    // * the control stays a direct item of the row
    BETWEEN: "contents",
  },
  // * one row from 20rem of room, stacked below it (the frame is the caller's @container)
  [EPairLayoutVariant.COMPACT]: {
    ROOT: "flex flex-col gap-2 @min-[20rem]/period-pair:flex-row @min-[20rem]/period-pair:items-end",
    ROOT_WITH_BETWEEN:
      "flex flex-col gap-2 @min-[20rem]/period-pair:flex-row @min-[20rem]/period-pair:items-end",
    BETWEEN: "contents",
  },
  // * side by side from `sm`, stacked below; with a control, a narrow track between
  [EPairLayoutVariant.PANELS]: {
    ROOT: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    ROOT_WITH_BETWEEN: "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
    BETWEEN: "flex justify-center sm:items-start sm:pt-1",
  },
} as const satisfies Record<EPairLayoutVariant, TPairLayoutClasses>;
