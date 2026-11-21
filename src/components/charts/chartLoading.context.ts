import { createContext } from "react";

/**
 * Whether the chart section is waiting for its data: the card, its header, toolbar, legend and
 * stats structure render for real; the plots draw ChartSkeleton and the values placeholders.
 */
export const ChartLoadingContext = createContext(false);
