import { useSearchCity } from "@/hooks/data/useSearchCity";
import { useDebounce } from "@/hooks/ui/useDebounce";
import type { TCoordinates, TWikidataCity } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TSearchBarProps } from "./SearchBar.type";
import { tryParseCoords } from "./SearchBar.util";

export function SearchBar({ onCitySelect, defaultValue = "" }: TSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(defaultValue);
  const [coordResult, setCoordResult] = useState<TCoordinates | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [dirty, setDirty] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 400);
  const searchQuery = !dirty || coordResult !== null ? "" : debouncedQuery;
  const { data: results = [], isLoading } = useSearchCity(searchQuery);

  const isOpen =
    !dismissed && (coordResult !== null || (debouncedQuery.length >= 2 && results.length > 0));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDismissed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setDirty(true);
    setDismissed(false);
    const trimmed = value.trim();
    const coords = tryParseCoords(trimmed);
    if (coords) {
      setCoordResult(coords);
    } else {
      setCoordResult(null);
    }
  }

  function handleSelectCity(city: TWikidataCity) {
    setQuery(city.label);
    setDismissed(true);
    onCitySelect(city);
  }

  function handleSelectCoords() {
    if (!coordResult) return;
    const label = `${coordResult.lat}, ${coordResult.lng}`;
    setQuery(label);
    setDismissed(true);
    onCitySelect({
      id: `coords:${coordResult.lat},${coordResult.lng}`,
      label,
      description: t("search.coordsResult"),
      lat: coordResult.lat,
      lng: coordResult.lng,
    });
  }

  const itemClass = `
    flex flex-col w-full px-4 py-2
    border-none
    text-left text-[length:var(--font-sm)] md:text-[length:var(--font-md)]
    bg-transparent hover:bg-[var(--color-bg-secondary)]
    cursor-pointer
    transition-colors duration-150
  `;

  return (
    <div ref={containerRef} className="relative w-full max-w-[480px]">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={t("search.placeholder")}
        className={`
          w-full px-3 md:px-4 py-2
          text-[length:var(--font-sm)] md:text-[length:var(--font-md)]
          placeholder:text-[var(--color-text-secondary)]
          border-2 border-[var(--color-border)] rounded-[var(--radius-md)] outline-none
          focus:border-[var(--color-primary)]
          transition-colors duration-200
        `}
      />

      {isLoading && debouncedQuery.length >= 2 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] border-2 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-[var(--radius-md)] animate-spin" />
      )}

      {isOpen && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[280px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-md overflow-y-auto z-[1000] list-none">
          {coordResult && (
            <li key="coord-result">
              <button type="button" onClick={handleSelectCoords} className={itemClass}>
                <span className="font-medium text-[var(--color-text)]">
                  {coordResult.lat}, {coordResult.lng}
                </span>
                <span className="text-[length:var(--font-xs)] md:text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
                  {t("search.coordsResult")}
                </span>
              </button>
            </li>
          )}
          {results.map((city) => (
            <li key={city.id}>
              <button onClick={() => handleSelectCity(city)} className={itemClass}>
                <span className="font-medium text-[var(--color-text)]">{city.label}</span>
                <span className="text-[length:var(--font-xs)] md:text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
                  {city.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
