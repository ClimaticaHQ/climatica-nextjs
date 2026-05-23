import { WorldClimService } from "@/libs";
import type {
  TBbox,
  TCellSize,
  TClimatePeriod,
  TProfileResult,
  TWorldClimAvgBoxBinding,
} from "@/types";
import { groupAvgBindings } from "@/utils";
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
        const raw = bbox
          ? await WorldClimService.getAvgPixelValuesInBox(
              bbox.north,
              bbox.south,
              bbox.west,
              bbox.east,
              gridSize,
              [varName],
              isClimate,
              isClimate ? undefined : year,
            )
          : await WorldClimService.getAvgPixelValuesInPolygon(
              wkt!,
              gridSize,
              [varName],
              isClimate,
              isClimate ? undefined : year,
            );

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
