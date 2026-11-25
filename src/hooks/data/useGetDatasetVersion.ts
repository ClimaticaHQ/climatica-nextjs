import { CLIMATE_PERIODS, WEATHER_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TCellSize, TDatasetAttribution } from "@/types";
import { buildRasterIri } from "@/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

// creator and version are dataset-wide (verified across grids, years and periods): any working grid fetches them
const REPRESENTATIVE_GRID: TCellSize = "10m";
const REPRESENTATIVE_VARIABLE = WEATHER_VARIABLES[0];
const REPRESENTATIVE_WEATHER_YEAR = 2024;

export function useGetDatasetVersion(): UseQueryResult<TDatasetAttribution, Error> {
  return useQuery<TDatasetAttribution, Error>({
    queryKey: ["dataset-version"],
    queryFn: async (): Promise<TDatasetAttribution> => {
      const [worldclimResource, cruTsResource] = await Promise.all([
        WorldClimService.getRasterResource(
          buildRasterIri(REPRESENTATIVE_GRID, REPRESENTATIVE_VARIABLE, CLIMATE_PERIODS.C1970_2000),
        ),
        WorldClimService.getRasterResource(
          buildRasterIri(REPRESENTATIVE_GRID, REPRESENTATIVE_VARIABLE, REPRESENTATIVE_WEATHER_YEAR),
        ),
      ]);

      return {
        worldclim: {
          creator: worldclimResource.creator.nolang,
          version: worldclimResource.version,
        },
        cruTs: {
          creator: cruTsResource.creator.nolang,
          version: cruTsResource.version,
        },
      };
    },
    staleTime: Infinity,
    retry: 1,
  });
}
