"use client";

import { useTranslations } from "next-intl";
import { FilterSection } from "../FilterSection";
import { PeriodPairSelector } from "../PeriodSelectors/PeriodPairSelector";
import type { TComparedPeriodsFilterProps } from "./ComparedPeriodsFilter.type";

/** Compare Periods' Period A ↔ Period B as a sidebar section (lg and up) — the page's selector. */
export function ComparedPeriodsFilter(props: TComparedPeriodsFilterProps) {
  const t = useTranslations();
  return (
    <FilterSection title={t("sidebar.sections.climatePeriod")}>
      <PeriodPairSelector {...props} isCompact />
    </FilterSection>
  );
}
