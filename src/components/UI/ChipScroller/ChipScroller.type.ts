import type { ReactNode } from "react";

export type TChipScrollerProps = {
  /** changes when the chips do, so the faded ends are measured again */
  contentKey: string;
  children: ReactNode;
};
