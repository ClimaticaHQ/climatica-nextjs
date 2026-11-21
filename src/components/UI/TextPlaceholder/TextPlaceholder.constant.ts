// * a value not loaded yet: a bar in the skeleton colour, on the baseline in the line height of
// * the text around it (an inline block holding a no-break space, so the line box stays the
// * text's), pulsing unless motion is off
export const TEXT_PLACEHOLDER_CLASS =
  "inline-block max-w-full animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-border)]";

export const NO_BREAK_SPACE = " ";

// * the placeholders' widths: a stat's value, a monthly values cell
export const TEXT_PLACEHOLDER_WIDTHS = {
  STAT: "w-[4.5ch]",
  CELL: "w-[3ch]",
} as const;
