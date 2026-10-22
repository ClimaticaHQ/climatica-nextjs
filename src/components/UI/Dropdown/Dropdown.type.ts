import type { TSeriesHatch, TSeriesShape } from "@/types";

export type TDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** an entity's shape before the label — e.g. a compared year's */
  markerShape?: TSeriesShape;
  /** a line under the label (why a disabled option is), announced as the option's description */
  description?: string;
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
  /** the button fills its container, the chevron at the far end */
  isStretched?: boolean;
};

export type TOptionMarkerProps = {
  shape: TSeriesShape;
  /** its bars' hatch too — an overlay's entity chips are its legend */
  hatch?: TSeriesHatch | undefined;
};
