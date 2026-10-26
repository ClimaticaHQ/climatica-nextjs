"use client";

import type { TNumberFormatter } from "@/types";
import { formatNumber } from "@/utils/numberFormat.util";
import { useLocale } from "next-intl";
import { useCallback } from "react";

/** formatNumber bound to the UI's locale. */
export function useFormatNumber(): TNumberFormatter {
  const locale = useLocale();
  return useCallback((value, options) => formatNumber(value, { ...options, locale }), [locale]);
}
