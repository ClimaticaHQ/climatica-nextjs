import { apiClient } from "@/libs/api";
import type { TCity, TCoordinates } from "@/types";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useLocale } from "next-intl";

export function useResolveCityByCoordinates(): UseMutationResult<
  TCity | null,
  Error,
  TCoordinates
> {
  const lang = useLocale();
  return useMutation<TCity | null, Error, TCoordinates>({
    mutationFn: async ({ lat, lng }) => {
      const { data: cities } = await apiClient.get<TCity[]>("/api/cities", {
        params: { q: `${lat},${lng}`, lang },
      });
      return cities[0] ?? null;
    },
  });
}
