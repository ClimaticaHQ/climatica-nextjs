import { EPairLayoutVariant } from "@/enums";
import type { TPairLayoutClasses } from "./PairLayout.type";

export const PAIR_LAYOUT_CLASSES = {
  [EPairLayoutVariant.ROW]: {
    ROOT: "flex items-end gap-2",
    ROOT_WITH_BETWEEN: "flex items-end gap-2",
    BETWEEN: "contents",
  },
  [EPairLayoutVariant.COMPACT]: {
    ROOT: "flex flex-col gap-2 @min-[20rem]/period-pair:flex-row @min-[20rem]/period-pair:items-end",
    ROOT_WITH_BETWEEN:
      "flex flex-col gap-2 @min-[20rem]/period-pair:flex-row @min-[20rem]/period-pair:items-end",
    BETWEEN: "contents",
  },
  [EPairLayoutVariant.PANELS]: {
    ROOT: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    ROOT_WITH_BETWEEN: "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
    BETWEEN: "flex justify-center sm:items-start sm:pt-1",
  },
} as const satisfies Record<EPairLayoutVariant, TPairLayoutClasses>;
