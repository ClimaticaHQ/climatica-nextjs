export const PERIOD_PAIR_SELECTOR_CLASSES = {
  ROW: "flex items-end gap-2",
  // * compact (sidebar): one row from 20rem of room, stacked below it — the swap then turns
  // * to point up / down, between the two
  COMPACT_FRAME: "@container/period-pair",
  COMPACT_ROW:
    "flex flex-col gap-2 @min-[20rem]/period-pair:flex-row @min-[20rem]/period-pair:items-end",
  COMPACT_SWAP: "self-center rotate-90 @min-[20rem]/period-pair:rotate-0",
} as const;
