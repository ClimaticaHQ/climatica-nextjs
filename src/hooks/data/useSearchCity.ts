import { apiClient } from "@/libs/api";
import type { TWikidataCity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

async function fetchCities(query: string, lang: string): Promise<TWikidataCity[]> {
  const { data } = await apiClient.get<TWikidataCity[]>("/api/cities", {
    params: { q: query, lang },
  });
  return data;
}

export function useSearchCity(query: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const trimmed = query.trim();

  return useQuery<TWikidataCity[]>({
    queryKey: ["citySearch", trimmed, lang],
    queryFn: () => fetchCities(trimmed, lang),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}
