import { WikidataService } from "@/libs";
import type { TCoordinates, TWikidataCity } from "@/types";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export function useResolveCityByCoordinates(): UseMutationResult<
  TWikidataCity | null,
  Error,
  TCoordinates
> {
  return useMutation<TWikidataCity | null, Error, TCoordinates>({
    mutationFn: ({ lat, lng }) => WikidataService.findNearestCityByCoordinates(lat, lng),
  });
}
