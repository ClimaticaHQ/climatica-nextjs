"use client";

import { getGridArc } from "@/utils/info.util";
import type { TCellSize } from "@/types";
import { useDisplayFormat } from "./useDisplayFormat";

/** A grid's resolution as the Info pages write it: "2.5′", "30″", in the UI's digits. */
export function useGridArcLabel() {
  const { formatValue } = useDisplayFormat();
  return (size: TCellSize) => {
    const { value, symbol, metric } = getGridArc(size);
    return `${formatValue(value, { metric })}${symbol}`;
  };
}
