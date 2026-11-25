"use client";

import { formatMonthName } from "@/utils/monthName.util";
import { useLocale } from "next-intl";
import { useCallback } from "react";

export function useMonthName() {
  const locale = useLocale();
  return useCallback((monthIndex: number) => formatMonthName({ locale, monthIndex }), [locale]);
}
