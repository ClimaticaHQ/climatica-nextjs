export type TFilterValueChipProps = {
  value: string;
  /** "Climate period: 1961–1990" */
  ariaLabel: string;
  /** not the default value — drawn in the light green variant */
  isChanged: boolean;
  /** not changeable in this view: drawn muted; the click opens the explanation instead */
  isDisabled: boolean;
  onClick: () => void;
};
