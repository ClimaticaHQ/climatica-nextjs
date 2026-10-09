"use client";

import { Button } from "@/components/UI/Button";
import { BottomSheet } from "@/components/UI/BottomSheet";
import { EBottomSheetHeight, EButtonVariant } from "@/enums";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import { useTranslations } from "next-intl";
import { FILTERS_SHEET_BUTTON_CLASS } from "../FiltersSheetFooter/FiltersSheetFooter.constant";
import type { TWalterLiethInfoSheetProps } from "./WalterLiethInfoSheet.type";

/** Why variables and months are disabled under Walter-Lieth — and the switch out of it. */
export function WalterLiethInfoSheet({
  isOpen,
  onClose,
  onSwitchToStandardChart,
}: TWalterLiethInfoSheetProps) {
  const t = useTranslations();

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t("chart.modeWalterLieth")}
      height={EBottomSheetHeight.AUTO}
      footer={
        <div className="flex">
          <Button
            variant={EButtonVariant.PRIMARY}
            onClick={onSwitchToStandardChart}
            className={FILTERS_SHEET_BUTTON_CLASS}
          >
            {getSwitchToStandardChartLabel(t)}
          </Button>
        </div>
      }
    >
      <p className="text-[length:var(--font-base)] text-[var(--color-text-secondary)]">
        {t("chart.walterLiethFiltersExplanation")}
      </p>
    </BottomSheet>
  );
}
