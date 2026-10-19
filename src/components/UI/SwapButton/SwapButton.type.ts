export type TSwapButtonProps = {
  /** what's swapped, for screen readers and the tooltip — e.g. "Swap periods" */
  label: string;
  onClick: () => void;
  /** a compact button in a label row, not growing it */
  isInline?: boolean;
  className?: string;
};
