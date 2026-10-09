"use client";

import { Button } from "@/components/UI/Button";
import { EButtonVariant, EFilterHintVariant } from "@/enums";
import { useTranslations } from "next-intl";
import { FilterHint } from "../../FilterHint";
import { FILTERS_SHEET_BUTTON_CLASS } from "./FiltersSheetFooter.constant";
import type { TFiltersSheetFooterProps } from "./FiltersSheetFooter.type";

/** A filter sheet's actions: Apply, and Reset in the full sheet. */
export function FiltersSheetFooter({ onApply, isApplyBlocked, onReset }: TFiltersSheetFooterProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      {isApplyBlocked && (
        <FilterHint text={t("sidebar.cellCount.tooManyError")} variant={EFilterHintVariant.ERROR} />
      )}
      <div className="flex gap-2">
        {onReset !== undefined && (
          <Button
            variant={EButtonVariant.SECONDARY}
            onClick={onReset}
            className={FILTERS_SHEET_BUTTON_CLASS}
          >
            {t("filters.sheet.reset")}
          </Button>
        )}
        <Button
          variant={EButtonVariant.PRIMARY}
          onClick={onApply}
          disabled={isApplyBlocked}
          className={FILTERS_SHEET_BUTTON_CLASS}
        >
          {t("filters.sheet.apply")}
        </Button>
      </div>
    </div>
  );
}
