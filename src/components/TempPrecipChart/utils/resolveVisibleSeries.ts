import type { TVariable, TVisibleSeries } from "@/types";

/**
 * Derives which series should be visible from the store's selected variables.
 * `tavg` has no corresponding fetched variable, so it's carried over from `prev`
 * rather than derived.
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
