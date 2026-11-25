export const CHIP_SCROLLER_CLASSES = {
  FRAME: "relative min-w-0 flex-1",
  // * room for the chips' tap targets (padding cancelled by a negative margin), which the scroller would otherwise clip
  SCROLLER:
    "pointer-events-none -my-[max(0.5rem,12px)] flex min-w-0 items-center gap-[max(0.5rem,8px)] overflow-x-auto py-[max(0.5rem,12px)] touch-gap-x-2 *:pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
} as const;
