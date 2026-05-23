import { SearchBar } from "@/components/SearchBar";
import { LocationIcon, SpinnerIcon } from "@/components/svg";
import { useTranslation } from "react-i18next";
import type { TLocationSearchProps } from "./LocationSearch.type";

export function LocationSearch({
  isLocating,
  locationError,
  defaultValue,
  showLocateButton = true,
  onCitySelect,
  onLocate,
  onClearLocationError,
}: TLocationSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            onCitySelect={onCitySelect}
            {...(defaultValue !== undefined ? { defaultValue } : {})}
          />
        </div>
        {showLocateButton && (
          <button
            type="button"
            onClick={onLocate}
            disabled={isLocating}
            aria-label={t("common.useMyLocation")}
            className="flex h-10 shrink-0 items-center gap-1.5 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[length:var(--font-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-150 hover:bg-[var(--color-bg-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? <SpinnerIcon /> : <LocationIcon />}
            <span className="hidden sm:inline">
              {isLocating ? t("common.locating") : t("common.useMyLocation")}
            </span>
          </button>
        )}
      </div>

      {locationError && (
        <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-error-border)] bg-[var(--color-error-bg)] px-3 py-2">
          <p className="flex-1 text-[length:var(--font-sm)] text-[var(--color-error)]">
            {locationError}
          </p>
          <button
            type="button"
            onClick={onClearLocationError}
            aria-label="Dismiss"
            className="shrink-0 text-[var(--color-error)] opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
