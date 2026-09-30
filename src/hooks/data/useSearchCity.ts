import { apiClient } from "@/libs/api";
import type { TCity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

async function fetchCities(query: string, lang: string): Promise<TCity[]> {
  const { data } = await apiClient.get<TCity[]>("/api/cities", {
    params: { q: query, lang },
  });
  return data;
}

export function useSearchCity(query: string) {
  const lang = useLocale();
  const trimmed = query.trim();

  return useQuery<TCity[]>({
    queryKey: ["citySearch", trimmed, lang],
    queryFn: () => fetchCities(trimmed, lang),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}
