export type TToggleSwitchProps = {
  label: string;
  description?: string | undefined;
  checked: boolean;
  onChange: () => void;
  isDisabled?: boolean | undefined;
};
