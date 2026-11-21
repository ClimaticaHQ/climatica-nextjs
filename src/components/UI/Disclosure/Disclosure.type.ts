import type { EDisclosureSize } from "@/enums";
import type { ReactNode } from "react";

export type TDisclosureProps = {
  /** the always-visible line that opens and closes it */
  summary: string;
  /** an anchor, so a link can point at this one */
  id?: string;
  size?: EDisclosureSize;
  children: ReactNode;
};
