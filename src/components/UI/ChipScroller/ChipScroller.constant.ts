export const CHIP_SCROLLER_CLASSES = {
  FRAME: "relative min-w-0 flex-1",
  // * room above and below (padding, cancelled by a negative margin) for the chips' tap targets,
  // * which the scroller would otherwise clip; side by side each reaches half the gap. The scroller
  // * itself takes no taps (its padding lies over the row above), its chips do
  SCROLLER:
    "pointer-events-none -my-[max(0.5rem,12px)] flex min-w-0 items-center gap-[max(0.5rem,8px)] overflow-x-auto py-[max(0.5rem,12px)] touch-gap-x-2 *:pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
} as const;
