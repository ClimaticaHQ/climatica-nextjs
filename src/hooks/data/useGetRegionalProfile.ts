import { apiClient } from "@/libs/api";
import type {
  TBbox,
  TCellSize,
  TClimatePeriod,
  TProfileResult,
  TRawAvgValueResponse,
  TWorldClimAvgBoxBinding,
} from "@/types";
import { buildGridIri, buildVariableIris, groupAvgBindings } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useGetRegionalProfile(
  bbox: TBbox | null,
  wkt: string | null,
  gridSize: TCellSize,
  isClimate: boolean,
  climatePeriod: TClimatePeriod,
  year: number | undefined,
  enabled: boolean,
) {
  const hasSelection = bbox !== null || wkt !== null;

  const { data, isLoading } = useQuery<TProfileResult, Error>({
    queryKey: [
      "regional-profile",
      bbox?.north,
      bbox?.south,
      bbox?.west,
      bbox?.east,
      wkt,
      gridSize,
      isClimate ? climatePeriod : year,
    ],
    queryFn: async (): Promise<TProfileResult> => {
      const fetchAvg = async (varName: string): Promise<TWorldClimAvgBoxBinding | null> => {
        const datasetParams = isClimate
          ? { isClimate: true }
          : { isWeather: true, year: year ?? new Date().getFullYear() };

        const endpoint = bbox
          ? "/api/worldclim/avgpixelvaluesinbox"
          : "/api/worldclim/avgpixelvaluesinpolygonGEO";

        const params = bbox
          ? {
              north: bbox.north,
              south: bbox.south,
              west: bbox.west,
              east: bbox.east,
              grid: buildGridIri(gridSize),
              var: buildVariableIris([varName]),
              ...datasetParams,
            }
          : {
              polygon: wkt!,
              grid: buildGridIri(gridSize),
              var: buildVariableIris([varName]),
              ...datasetParams,
            };

        const { data: raw } = await apiClient.get<TRawAvgValueResponse>(endpoint, { params });
        const allBindings = groupAvgBindings(raw.results.bindings);
        const filtered = isClimate
          ? allBindings.filter((b) => b.raster?.value?.includes(climatePeriod))
          : allBindings;
        return filtered[0] ?? null;
      };

      const [tmax, tmin, prec] = await Promise.all([
        fetchAvg("tmax"),
        fetchAvg("tmin"),
        fetchAvg("prec"),
      ]);

      return { tmax, tmin, prec };
    },
    enabled: hasSelection && enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    profileData: data ?? null,
    isProfileLoading: hasSelection && enabled && isLoading,
  };
}
