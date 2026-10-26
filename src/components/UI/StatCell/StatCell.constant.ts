// * text sizes scale with the bar's own width (container query units), so a wide bar gets
// * the larger sizes and a narrow split panel's five cells still keep their values on one line
export const STAT_TEXT_CLASSES = {
  LABEL: "text-[clamp(11px,3cqi,12px)]",
  VALUE: "text-[clamp(15px,4.4cqi,18px)]",
  META: "text-[clamp(11px,3cqi,12px)]",
} as const;

export const STAT_CELL_VALUE_CLASS = `whitespace-nowrap ${STAT_TEXT_CLASSES.VALUE} font-medium tabular-nums text-[var(--color-text)]`;
