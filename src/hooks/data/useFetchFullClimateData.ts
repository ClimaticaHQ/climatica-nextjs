import { CLIMATE_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TExportRawData, TFetchFullClimateDataParams } from "@/types";
import { extractAllVariablesFromPointValues, filterPointBindingsByPeriod } from "@/utils";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

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
