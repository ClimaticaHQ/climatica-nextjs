export type TFilterChipProps = {
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  /** active, but can't be turned off — a not-allowed cursor, announced as disabled */
  isLocked?: boolean;
  /** a colour dot before the label — e.g. a compared year's series colour */
  dotColor?: string;
  onClick?: () => void;
};
