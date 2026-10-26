"use client";

import { formatMonthName } from "@/utils/monthName.util";
import { useLocale } from "next-intl";
import { useCallback } from "react";

/** A month's name (0 = January) in the current locale, for summary values. */
export function useMonthName() {
  const locale = useLocale();
  return useCallback((monthIndex: number) => formatMonthName({ locale, monthIndex }), [locale]);
}
