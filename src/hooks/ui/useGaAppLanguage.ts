"use client";

import { setAppLanguage } from "@/utils/analyticsConsent.util";
import { useLocale } from "next-intl";
import { useEffect } from "react";

// * call before useGaPageViews: effects run in order, so the first page view already carries the language
export function useGaAppLanguage() {
  const locale = useLocale();

  useEffect(() => {
    setAppLanguage(locale);
  }, [locale]);
}
