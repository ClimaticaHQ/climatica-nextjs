"use client";

import { Button } from "@/components/UI";
import { INFO_SECTION_IDS, ROUTES } from "@/constants";
import { EButtonVariant } from "@/enums";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createPortal } from "react-dom";
import { CONSENT_CLASSES as C } from "./consent.constant";
import type { TConsentBannerProps } from "./consent.type";

/** a labelled region, not a dialog: it takes no focus and traps none */
export function ConsentBanner({ onAccept, onReject }: TConsentBannerProps) {
  const t = useTranslations("consent");

  // * in <body>, outside the app's scroll container: it overlays the page and adds no scroll height
  return createPortal(
    <section aria-label={t("label")} className={C.BANNER}>
      <p className={C.TEXT}>
        {t("text")}{" "}
        <Link href={`${ROUTES.ABOUT}#${INFO_SECTION_IDS.PRIVACY}`} className={C.LINK}>
          {t("privacy")}
        </Link>
      </p>
      <div className={C.ACTIONS}>
        <Button variant={EButtonVariant.SECONDARY} onClick={onAccept} className={C.BUTTON}>
          {t("accept")}
        </Button>
        <Button variant={EButtonVariant.SECONDARY} onClick={onReject} className={C.BUTTON}>
          {t("reject")}
        </Button>
      </div>
    </section>,
    document.body,
  );
}
