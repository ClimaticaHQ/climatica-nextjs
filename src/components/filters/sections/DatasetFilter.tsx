"use client";

import { Chip } from "@/components/UI/Chip";
import { DATASETS } from "@/constants";
import { EFilterKey } from "@/enums";
import { useTranslations } from "next-intl";
import { FilterSection } from "../FilterSection";
import type { TFilterSectionRenderProps } from "../filters.type";

export function DatasetFilter({ values, onChange }: TFilterSectionRenderProps) {
  const t = useTranslations();

  return (
    <FilterSection title={t("sidebar.sections.dataset")}>
      <div className="flex flex-wrap gap-2">
        {Object.values(DATASETS).map((dataset) => (
          <Chip
            key={dataset}
            label={t(`sidebar.datasets.${dataset}`)}
            isActive={values.dataset === dataset}
            onClick={() => onChange(EFilterKey.DATASET, dataset)}
          />
        ))}
      </div>
    </FilterSection>
  );
}
