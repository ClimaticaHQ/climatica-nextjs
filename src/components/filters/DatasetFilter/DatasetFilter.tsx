"use client";

import { FilterChip } from "@/components/FilterChip";
import { DATASETS } from "@/constants";
import { useTranslations } from "next-intl";
import { FilterSection } from "../FilterSection";
import type { TDatasetFilterProps } from "./DatasetFilter.type";

export function DatasetFilter({ value, onChange }: TDatasetFilterProps) {
  const t = useTranslations();

  return (
    <FilterSection title={t("sidebar.sections.dataset")}>
      <div className="flex flex-wrap gap-2">
        {Object.values(DATASETS).map((dataset) => (
          <FilterChip
            key={dataset}
            label={t(`sidebar.datasets.${dataset}`)}
            isActive={value === dataset}
            onClick={() => onChange(dataset)}
          />
        ))}
      </div>
    </FilterSection>
  );
}
