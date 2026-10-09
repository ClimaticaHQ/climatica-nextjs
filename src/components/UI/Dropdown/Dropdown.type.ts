export type TDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** a colour dot before the label — e.g. a compared year's series colour */
  color?: string;
};

export type TDropdownProps = {
  options: TDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "data-testid"?: string;
  optionTestIdPrefix?: string;
  /** the id of the visible label naming the dropdown (its value is read after it) */
  ariaLabelledBy?: string;
  /** a CSS colour for the button's border — e.g. a comparison series' colour */
  accentColor?: string;
  /** the button fills its container, the chevron at the far end */
  isStretched?: boolean;
};

export type TOptionDotProps = {
  color: string;
};
