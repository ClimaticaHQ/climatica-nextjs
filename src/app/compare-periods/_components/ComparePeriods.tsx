"use client";

import { useComparePeriodsPage } from "@/hooks/pages/useComparePeriodsPage";
import { ComparePeriodsView } from "./ComparePeriodsView";

export function ComparePeriods() {
  return <ComparePeriodsView page={useComparePeriodsPage()} />;
}
