"use client";

import { CloseIcon } from "@/components/svg";
import { FOCUS_RING_CLASS } from "@/constants";
import { useTranslations } from "next-intl";
import type { TBottomSheetHeaderProps } from "./BottomSheet.type";

/** The sheet's title (labelling the dialog) and its close button. */
export function BottomSheetHeader({ title, titleId, onClose }: TBottomSheetHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-3">
      <h2
        id={titleId}
        className="text-[length:var(--font-base)] font-semibold text-[var(--color-text)]"
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className={`${FOCUS_RING_CLASS} -mr-2 rounded-[var(--radius-sm)] p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]`}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
