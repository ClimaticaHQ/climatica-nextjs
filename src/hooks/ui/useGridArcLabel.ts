"use client";

import { getGridArc } from "@/utils/info.util";
import type { TCellSize } from "@/types";
import { useDisplayFormat } from "./useDisplayFormat";

export function useGridArcLabel() {
  const { formatValue } = useDisplayFormat();
  return (size: TCellSize) => {
    const { value, symbol, metric } = getGridArc(size);
    return `${formatValue(value, { metric })}${symbol}`;
  };
}
