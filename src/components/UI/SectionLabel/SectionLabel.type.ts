import type { ETextScale } from "@/enums";

export type TSectionLabelProps = {
  text: string;
  /** TOUCH: the touch scale below lg (a filter section in a sheet); DEFAULT otherwise */
  textScale?: ETextScale;
};
