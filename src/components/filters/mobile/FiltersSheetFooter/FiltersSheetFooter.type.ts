export type TFiltersSheetFooterProps = {
  onApply: () => void;
  /** too many heat map cells — Apply is disabled, and the footer says why */
  isApplyBlocked: boolean;
  /** shows Reset (to the defaults) when given */
  onReset?: () => void;
};
