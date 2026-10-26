import { CLIMATE_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TExportRawData, TFetchFullClimateDataParams } from "@/types";
import { extractAllVariablesFromPointValues, filterPointBindingsByPeriod } from "@/utils";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

/** Lazy, on-demand fetch of every SCRAPI variable for the raw CSV/JSON export —
 * separate from useGetClimateData, which only ever requests tmax/tmin/prec. */
export function useFetchFullClimateData(): UseMutationResult<
  TExportRawData,
  Error,
  TFetchFullClimateDataParams
> {
  return useMutation<TExportRawData, Error, TFetchFullClimateDataParams>({
    mutationFn: async ({ lat, lng, gridSize, climatePeriod }) => {
      const response = await WorldClimService.getClimateDataForPoint(
        lat,
        lng,
        gridSize,
        CLIMATE_VARIABLES,
      );
      const bindings = filterPointBindingsByPeriod(response.results.bindings, climatePeriod);
      return {
        rows: extractAllVariablesFromPointValues(bindings),
        variables: CLIMATE_VARIABLES,
      };
    },
  });
}
