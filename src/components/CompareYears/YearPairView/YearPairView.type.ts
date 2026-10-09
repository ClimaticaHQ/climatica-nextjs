import type { TPair, TYearOption } from "@/types";
import type { ReactNode } from "react";

export type TYearPairViewProps = {
  /** the compared years, in the page's order */
  years: readonly TYearOption[];
  /** the two drawn, resolved by the caller */
  pair: TPair<number>;
  /** with more than two years: the pickers and the swap change the pair */
  onPairChange?: ((pair: TPair<number>) => void) | undefined;
  /** a year's panel, its picker (if any) in place of the name */
  renderPanel: (year: number, name: ReactNode | undefined) => ReactNode;
  legend: ReactNode;
};
