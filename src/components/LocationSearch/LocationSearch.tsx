import { SearchBar } from "@/components/SearchBar";
import { LocationIcon, SpinnerIcon } from "@/components/svg";
import { Button } from "@/components/UI";
import { EButtonVariant } from "@/enums";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();

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
          <Button
            variant={EButtonVariant.SECONDARY}
            onClick={onLocate}
            disabled={isLocating}
            ariaLabel={t("common.useMyLocation")}
            className="flex h-10 shrink-0 items-center gap-1.5 px-3 text-[length:var(--font-sm)]"
          >
            {isLocating ? <SpinnerIcon /> : <LocationIcon />}
            <span className="hidden sm:inline">
              {isLocating ? t("common.locating") : t("common.useMyLocation")}
            </span>
          </Button>
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
