"use client";

import { useCompareCitiesPage } from "@/hooks/pages/useCompareCitiesPage";
import { CompareCitiesView } from "./CompareCitiesView";

export function CompareCities() {
  return <CompareCitiesView page={useCompareCitiesPage()} />;
}
