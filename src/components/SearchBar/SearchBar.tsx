import { useDebounce, useSearchCity } from "@/hooks";
import type { TCoordinates, TWikidataCity } from "@/types";
import { useTranslations } from "next-intl";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import type { TSearchBarProps } from "./SearchBar.type";
import { tryParseCoords } from "./SearchBar.util";

export function SearchBar({ onCitySelect, defaultValue = "" }: TSearchBarProps) {
  const t = useTranslations();
  const [query, setQuery] = useState(defaultValue);
  const [coordResult, setCoordResult] = useState<TCoordinates | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lastConfig, setLastConfig] = useState({ len: 0, open: false });

  const debouncedQuery = useDebounce(query, 400);
  const searchQuery = !dirty || coordResult !== null ? "" : debouncedQuery;
  const { data: results = [], isLoading } = useSearchCity(searchQuery);

  const dropdownItems = coordResult ? ["COORDS", ...results] : results;
  const isOpen =
    !dismissed && (coordResult !== null || (debouncedQuery.length >= 2 && results.length > 0));

  if (dropdownItems.length !== lastConfig.len || isOpen !== lastConfig.open) {
    setLastConfig({ len: dropdownItems.length, open: isOpen });
    setActiveIndex(-1);
  }

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDismissed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      // * finding all list items and scrolling the active one into view
      const listItems = containerRef.current.querySelectorAll("li");
      const activeElement = listItems[activeIndex];

      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest", // * only scrolls if the element is not fully visible
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  function handleInputChange(value: string) {
    setQuery(value);
    setDirty(true);
    setDismissed(false);
    const trimmed = value.trim();
    const coords = tryParseCoords(trimmed);
    setCoordResult(coords || null);
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

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    const handlers: Record<string, () => void> = {
      ArrowDown: () => {
        e.preventDefault();
        setActiveIndex((prev) => (prev < dropdownItems.length - 1 ? prev + 1 : prev));
      },
      ArrowUp: () => {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
      },
      Enter: () => {
        if (activeIndex === -1) return;

        e.preventDefault();
        const selectedItem = dropdownItems[activeIndex];

        if (selectedItem === "COORDS") {
          handleSelectCoords();
        } else {
          handleSelectCity(selectedItem as TWikidataCity);
        }
      },
      Escape: () => {
        setDismissed(true);
      },
    };

    handlers[e.key]?.();
  }

  const getItemClass = (index: number) => `
    flex flex-col w-full px-4 py-2
    border-none 
    text-[var(--color-text)]
    text-left text-[length:var(--font-sm)] md:text-[length:var(--font-md)]
    cursor-pointer 
    transition-colors duration-150
    ${activeIndex === index ? "bg-[var(--color-bg-secondary)]" : "hover:bg-[var(--color-bg-secondary)]"}
  `;

  return (
    <div ref={containerRef} className="relative w-full max-w-[480px]">
      <input
        data-testid="city-search-input"
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
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

      {isLoading && dirty && debouncedQuery.length >= 2 && (
        <span
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 
            w-[18px] h-[18px] 
            border-2 border-[var(--color-border)] border-t-[var(--color-primary)] 
            rounded-[var(--radius-md)] 
            animate-spin
          `}
        />
      )}

      {isOpen && (
        <ul
          data-testid="city-search-results"
          className={`
            absolute top-[calc(100%+4px)] left-0 right-0 max-h-[280px] 
            bg-[var(--color-bg)] 
            border border-[var(--color-border)] 
            rounded-[var(--radius-lg)] 
            shadow-md 
            overflow-y-auto z-[1000] 
            list-none
          `}
        >
          {dropdownItems.map((item, index) => {
            if (item === "COORDS") {
              return (
                <li key="coord-result">
                  <button
                    type="button"
                    onClick={handleSelectCoords}
                    className={getItemClass(index)}
                  >
                    <span className="font-medium text-[var(--color-text)]">
                      {coordResult?.lat}, {coordResult?.lng}
                    </span>
                    <span className="text-[length:var(--font-xs)] md:text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
                      {t("search.coordsResult")}
                    </span>
                  </button>
                </li>
              );
            }

            const city = item as TWikidataCity;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={getItemClass(index)}
                >
                  <span className="font-medium text-[var(--color-text)]">{city.label}</span>
                  <span className="text-[length:var(--font-xs)] md:text-[length:var(--font-sm)] text-[var(--color-text-secondary)]">
                    {city.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
