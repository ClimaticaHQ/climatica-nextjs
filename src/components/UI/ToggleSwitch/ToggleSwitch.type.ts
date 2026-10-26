export type TToggleSwitchProps = {
  label: string;
  /** a line under the label saying what the switch does, announced as the switch's description */
  description?: string | undefined;
  checked: boolean;
  onChange: () => void;
  /** inert and dimmed — e.g. overruled by the device, or depending on a setting that's off */
  isDisabled?: boolean | undefined;
};
