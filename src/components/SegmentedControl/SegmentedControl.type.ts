import type { ESegmentedSize } from "@/enums";
import type { CSSProperties, ReactNode } from "react";

export type TSegmentedOption<TValue extends string> = {
  value: TValue;
  label: string;
  icon: ReactNode;
};

export type TSegmentedControlProps<TValue extends string> = {
  label: string;
  options: readonly TSegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  isDisabled?: boolean | undefined;
  isFlat?: boolean | undefined;
  isIconOnlyBelowSm?: boolean | undefined;
  isLabelTruncated?: boolean | undefined;
  size?: ESegmentedSize | undefined;
  ariaDescribedBy?: string | undefined;
};

export type TSegmentedRoomStyle = CSSProperties & Record<"--segmented-room", string>;
