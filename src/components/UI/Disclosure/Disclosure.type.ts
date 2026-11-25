import type { EDisclosureSize } from "@/enums";
import type { ReactNode } from "react";

export type TDisclosureProps = {
  summary: string;
  id?: string;
  size?: EDisclosureSize;
  children: ReactNode;
};
