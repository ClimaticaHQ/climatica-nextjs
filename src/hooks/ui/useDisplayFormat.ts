"use client";

import type { TDisplayFormat } from "@/types";
import { formatDifference, formatValue } from "@/utils/displayFormat.util";
import { useLocale } from "next-intl";
import { useMemo } from "react";

export function useDisplayFormat(): TDisplayFormat {
  const locale = useLocale();
  return useMemo(
    () => ({
      formatValue: (value, options) => formatValue(value, { ...options, locale }),
      formatDifference: (options) => formatDifference({ ...options, locale }),
    }),
    [locale],
  );
}
