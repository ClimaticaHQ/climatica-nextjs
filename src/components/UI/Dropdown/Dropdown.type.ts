import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  markerShape?: TSeriesShape;
  description?: string;
};

export type TDropdownProps = {
  options: TDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "data-testid"?: string;
  optionTestIdPrefix?: string;
  ariaLabelledBy?: string;
  isStretched?: boolean;
};

export type TOptionMarkerProps = {
  shape: TSeriesShape;
  hatch?: TSeriesHatch | undefined;
  fill?: string | undefined;
};
