import { SearchBar } from "@/components/SearchBar";
import { LocationIcon, SpinnerIcon } from "@/components/svg";
import { Button, StatusMessage } from "@/components/UI";
import { FORM_CONTROL_CLASSES } from "@/constants";
import { EButtonVariant, EStatusMessageVariant } from "@/enums";
import { useTranslations } from "next-intl";
import type { TLocationSearchProps } from "./LocationSearch.type";

export function LocationSearch({
  isLocating,
  locationError,
  cityLabel,
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
            {...(cityLabel !== undefined ? { cityLabel } : {})}
          />
        </div>
        {showLocateButton && (
          <Button
            variant={EButtonVariant.SECONDARY}
            onClick={onLocate}
            disabled={isLocating}
            ariaLabel={t("common.useMyLocation")}
            className={`${FORM_CONTROL_CLASSES.HEIGHT} flex shrink-0 items-center gap-1.5 px-3 text-[length:var(--font-sm)]`}
          >
            {isLocating ? <SpinnerIcon /> : <LocationIcon />}
            <span className="hidden sm:inline">
              {isLocating ? t("common.locating") : t("common.useMyLocation")}
            </span>
          </Button>
        )}
      </div>

      {locationError && (
        <StatusMessage
          variant={EStatusMessageVariant.ERROR}
          message={locationError}
          onDismiss={onClearLocationError}
        />
      )}
    </div>
  );
}
