const FRAME = "rounded-[var(--radius-sm)] border";
const BORDER_COLOR = "border-[var(--color-border)]";
const HEIGHT = "h-[max(2.5rem,40px)] touch-target";
const HOVER = "hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]";

export const FORM_CONTROL_CLASSES = {
  FRAME,
  BORDER_COLOR,
  HEIGHT,
  HOVER,
  // * an input can't draw a ::before: a label around it carries the target and passes taps on
  FIELD_TARGET: "touch-target flex w-full",
  OUTLINE: `${FRAME} ${BORDER_COLOR} bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors duration-150 ${HOVER}`,
  INPUT: `${FRAME} ${BORDER_COLOR} ${HEIGHT} w-full bg-[var(--color-surface)] px-3 text-[var(--color-text)] outline-none transition-colors duration-150 placeholder:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50`,
} as const;
