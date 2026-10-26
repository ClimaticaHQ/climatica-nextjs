import { REGIONAL_PROFILE_VARIABLES } from "@/constants";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TProfileResult, TUseGetRegionalProfileArgs } from "@/types";
import { extractPixelIri } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useGetRegionalProfile({
  area,
  gridSize,
  dataset,
  isEnabled,
}: TUseGetRegionalProfileArgs) {
  const hasSelection = area !== null;

  const { data, isLoading, error } = useQuery<TProfileResult, Error>({
    queryKey: ["regional-profile", area, gridSize, dataset],
    queryFn: async (): Promise<TProfileResult> => {
      const averages = await WorldClimService.getRegionAverages({
        area: area!,
        gridSize,
        variables: REGIONAL_PROFILE_VARIABLES,
        dataset,
      });
      const byVariable = (variable: string) => {
        const raster = extractPixelIri(
          averages.map((average) => average.raster?.value ?? ""),
          variable,
        );
        return averages.find((average) => average.raster?.value === raster) ?? null;
      };
      return { tmax: byVariable("tmax"), tmin: byVariable("tmin"), prec: byVariable("prec") };
    },
    enabled: hasSelection && isEnabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    profileData: data ?? null,
    isProfileLoading: hasSelection && isEnabled && isLoading,
    // * a failed request is an error, never a profile — the panel isn't drawn from it
    profileError: error ?? null,
  };
}
