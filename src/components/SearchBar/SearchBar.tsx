import { TIME_CONSTANTS } from "@/constants";
import { WikidataService } from "@/libs";
import type { TCoordinates, TWikidataCity } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TSearchBarProps } from "./SearchBar.type";
import { tryParseCoords } from "./SearchBar.util";

export function SearchBar({ onCitySelect, defaultValue = "" }: TSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<TWikidataCity[]>([]);
  const [coordResult, setCoordResult] = useState<TCoordinates | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();

    const coords = tryParseCoords(trimmed);
    if (coords) {
      setCoordResult(coords);
      setResults([]);
      setIsOpen(true);
      return;
    }

    setCoordResult(null);

    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      WikidataService.searchCity(trimmed)
        .then((cities) => {
          setResults(cities);
          setIsOpen(cities.length > 0);
        })
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, TIME_CONSTANTS.FOUR_HUNDRED_MILLISECONDS);
  }

  function handleSelectCity(city: TWikidataCity) {
    setQuery(city.label);
    setIsOpen(false);
    onCitySelect(city);
  }

  function handleSelectCoords() {
    if (!coordResult) return;
    const label = `${coordResult.lat}, ${coordResult.lng}`;
    setQuery(label);
    setIsOpen(false);
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

      {isLoading && (
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
