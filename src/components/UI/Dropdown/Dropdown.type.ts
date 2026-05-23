export type TDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type TDropdownProps = {
  options: TDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};
