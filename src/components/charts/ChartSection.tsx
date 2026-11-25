"use client";

import { ExportMenu } from "@/components/UI";
import { EDataStatus } from "@/enums";
import { useTranslations } from "next-intl";
import { ChartCard } from "./ChartCard";
import { SectionBlocks } from "./ChartBlocks";
import { CHART_SECTION_CLASSES as C } from "./charts.constant";
import type { TChartSectionProps } from "./charts.type";
import { ChartLoadingContext } from "./chartLoading.context";

export function ChartSection({ chart, scrollRef }: TChartSectionProps) {
  const t = useTranslations();
  const { state, model, viewState, features, exportMenu, onVisibleChange } = chart;
  const isLoading = state.status === EDataStatus.LOADING;
  if (!isLoading && state.status !== EDataStatus.READY) return null;

  return (
    <ChartLoadingContext.Provider value={isLoading}>
      <div ref={scrollRef} data-testid="climate-chart" aria-busy={isLoading} className={C.ROOT}>
        {isLoading && <span className="sr-only">{t("loading.chart")}</span>}
        <div className={C.TOOLBAR}>
          <ExportMenu {...exportMenu} {...(isLoading ? { isDisabled: true } : {})} />
        </div>
        <div className={C.CONTENT}>
          <SectionBlocks model={model} features={features} />
          <ChartCard
            model={model}
            viewState={viewState}
            features={features}
            onVisibleChange={onVisibleChange}
          />
        </div>
      </div>
    </ChartLoadingContext.Provider>
  );
}
