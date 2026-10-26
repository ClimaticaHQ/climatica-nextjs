import type { TVariable, TVisibleSeries } from "@/types";

/**
 * Which series are visible for the selected variables. tavg has no fetched variable, so it's
 * carried over from prev rather than derived.
 */
export function resolveVisibleSeries(
  variables: readonly TVariable[] | undefined,
  prev: TVisibleSeries,
): TVisibleSeries {
  if (!variables) return prev;
  return {
    tmax: variables.includes("tmax"),
    tmin: variables.includes("tmin"),
    tavg: prev.tavg,
    prec: variables.includes("prec"),
  };
}
