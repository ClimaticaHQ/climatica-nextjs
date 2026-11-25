"use client";

import { ChevronDownIcon } from "@/components/svg";
import { useTranslations } from "next-intl";
import { INFO_CONTENTS_BAR_CLASSES as C } from "../info.constant";
import type { TInfoContentsBarProps } from "../info.type";

export function InfoContentsBar({
  pageLabel,
  sectionLabel,
  isOpen,
  onOpen,
}: TInfoContentsBarProps) {
  const t = useTranslations();
  return (
    <div className={C.ROOT}>
      <nav aria-label={t("info.nav.breadcrumb")} className={C.TRAIL}>
        <span aria-current="page" className={C.PAGE} data-breadcrumb-page>
          {pageLabel}
        </span>
        {sectionLabel !== null && (
          <>
            <span aria-hidden="true" className={C.SEPARATOR}>
              <ChevronDownIcon open={false} />
            </span>
            <span className={C.SECTION}>{sectionLabel}</span>
          </>
        )}
      </nav>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={C.BUTTON}
      >
        {t("info.nav.contents")}
        <ChevronDownIcon open={false} />
      </button>
    </div>
  );
}
