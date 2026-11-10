// * text sizes scale with the bar's own width (container query units), so a wide bar gets
// * the larger sizes and a narrow split panel's five cells still keep their values on one line
export const STAT_TEXT_CLASSES = {
  LABEL: "text-[length:clamp(var(--font-2xs),3cqi,var(--font-xs))]",
  VALUE: "text-[length:clamp(0.9375rem,4.4cqi,var(--font-md))]",
  META: "text-[length:clamp(var(--font-2xs),3cqi,var(--font-xs))]",
} as const;

export const STAT_CELL_VALUE_CLASS = `whitespace-nowrap ${STAT_TEXT_CLASSES.VALUE} font-medium tabular-nums text-[var(--color-text)]`;

// * an annotation attached to a stat: pinned to the cell's top right, out of its text's flow
export const STAT_CELL_MARKER_CLASSES = {
  CELL: "relative",
  MARKER: "absolute right-1 top-1",
} as const;
