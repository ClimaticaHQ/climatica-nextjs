import { WikidataService } from "@/api";
import type { TWikidataCity } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useSearchCity(query: string) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const trimmed = query.trim();

  return useQuery<TWikidataCity[]>({
    queryKey: ["citySearch", trimmed, lang],
    queryFn: () => WikidataService.searchCity(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}
