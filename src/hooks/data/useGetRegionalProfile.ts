import { WorldClimService } from "@/libs/services/worldClimService";
import type {
  TBbox,
  TCellSize,
  TClimatePeriod,
  TProfileResult,
  TVariable,
  TWorldClimAvgBoxBinding,
} from "@/types";
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
      const fetchAvg = (varName: TVariable): Promise<TWorldClimAvgBoxBinding | null> => {
        const area = bbox ? { bbox } : { wkt: wkt! };

        return WorldClimService.getRegionalAverage(
          [varName],
          gridSize,
          area,
          isClimate,
          climatePeriod,
          year,
        );
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
