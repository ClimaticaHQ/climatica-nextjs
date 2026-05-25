import { apiClient } from "@/libs/api";
import type { TCoordinates, TWikidataCity } from "@/types";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export function useResolveCityByCoordinates(): UseMutationResult<
  TWikidataCity | null,
  Error,
  TCoordinates
> {
  return useMutation<TWikidataCity | null, Error, TCoordinates>({
    mutationFn: async ({ lat, lng }) => {
      const { data: cities } = await apiClient.get<TWikidataCity[]>("/api/cities", {
        params: { q: `${lat},${lng}` },
      });
      return cities[0] ?? null;
    },
  });
}
