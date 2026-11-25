import type { ReactNode } from "react";
import type { EStatLabelSize, EStatValueSize } from "@/enums";
import type { TUpdateFlashKeys } from "@/types";

export type TStatCardProps = {
  label: string;
  value: ReactNode;
  unit?: string | undefined;
  sub?: string | undefined;
  valueColor?: string | undefined;
  valueSize?: EStatValueSize | undefined;
  labelSize?: EStatLabelSize | undefined;
  flashKeys?: TUpdateFlashKeys | undefined;
};
