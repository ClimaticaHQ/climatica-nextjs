import { apiClient } from "@/libs/api";
import type { TCity, TCoordinates } from "@/types";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export function useResolveCityByCoordinates(): UseMutationResult<
  TCity | null,
  Error,
  TCoordinates
> {
  return useMutation<TCity | null, Error, TCoordinates>({
    mutationFn: async ({ lat, lng }) => {
      const { data: cities } = await apiClient.get<TCity[]>("/api/cities", {
        params: { q: `${lat},${lng}` },
      });
      return cities[0] ?? null;
    },
  });
}
