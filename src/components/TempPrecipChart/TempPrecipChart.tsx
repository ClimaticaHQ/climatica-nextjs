import {
  FilterChip,
  WalterLiethChart,
  WalterLiethCitiesLayout,
  WalterLiethPeriodsLayout,
} from "@/components";
import { CLIMATE_PERIOD_LABELS, DATASETS } from "@/constants";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CompareChart, MultiPeriodChart, StandardClimateChart } from "./charts";
import { ModeToggle } from "./components";
import { useTempPrecipChart } from "./hooks";
import { CalendarIcon, DatabaseIcon } from "./icons";
import type { TChartMode, TTempPrecipChartProps, TVisibleSeries } from "./TempPrecipChart.type";

const DEFAULT_VISIBLE: TVisibleSeries = { tmax: true, tmin: true, tavg: false, prec: true };

export function TempPrecipChart(props: TTempPrecipChartProps) {
  const t = useTranslations();
  const [visible, setVisible] = useState<TVisibleSeries>(DEFAULT_VISIBLE);
  const [chartMode, setChartMode] = useState<TChartMode>("standard");
  const [prevVariables, setPrevVariables] = useState(props.variables);

  /** Render-phase state update — intentional; avoids a stale-render flash from useEffect */
  if (props.variables !== prevVariables) {
    setPrevVariables(props.variables);
    if (props.variables) {
      const vars = props.variables;
      setVisible((prev) => ({
        tmax: vars.includes("tmax"),
        tmin: vars.includes("tmin"),
        tavg: prev.tavg,
        prec: vars.includes("prec"),
      }));
    }
  }

  const chart = useTempPrecipChart(props);

  if (!chart.hasData) return null;

  const canUseWalterLieth = props.showWalterLiethToggle !== false && !chart.isMultiPeriod;
  const isWalterLieth = canUseWalterLieth && chartMode === "walter-lieth";
  const showAridity = props.showAridity !== false;
  const activeCount = Object.values(visible).filter(Boolean).length;

  function handleToggle(key: keyof TVisibleSeries) {
    if (visible[key] && activeCount === 1) return;
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selectedMonth =
    !chart.isCompare && props.selectedMonths?.length === 1 ? props.selectedMonths[0] : null;

  const subtitleText = props.subtitle
    ? (props.subtitle.rawLabel ??
      (props.subtitle.dataset === DATASETS.CLIMATE && props.subtitle.climatePeriod
        ? t("chart.subtitle.climate", {
            period: CLIMATE_PERIOD_LABELS[props.subtitle.climatePeriod],
          })
        : props.subtitle.weatherYear !== undefined
          ? t("chart.subtitle.weather", { year: props.subtitle.weatherYear })
          : null))
    : null;

  const storeVarSet = new Set<string>(props.variables ?? []);

  const chips: { key: keyof TVisibleSeries; label: string }[] = [
    { key: "tmax", label: t("sidebar.variables.tmax") },
    { key: "tmin", label: t("sidebar.variables.tmin") },
    { key: "tavg", label: t("sidebar.variables.tavg") },
    { key: "prec", label: t("sidebar.variables.prec") },
  ];

  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {canUseWalterLieth && <ModeToggle mode={chartMode} onChange={setChartMode} />}
        {props.cityName && (
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]">
              {t("chart.title")}: {props.cityName}
            </h3>
            {(!!subtitleText || (!isWalterLieth && selectedMonth !== null)) && (
              <div className="flex flex-wrap items-center gap-2">
                {!!subtitleText && (
                  <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                    <DatabaseIcon />
                    {subtitleText}
                  </span>
                )}
                {!isWalterLieth && selectedMonth !== null && (
                  <span className="flex items-center gap-1" style={{ color: "#1a6fa0" }}>
                    <CalendarIcon />
                    <span
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "#e8f4fd",
                        border: "0.5px solid #b3d9f5",
                        color: "#1a6fa0",
                      }}
                    >
                      {t(`months.${selectedMonth}`)}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {chips.map(({ key, label }) => {
            const isLastActive = visible[key] && activeCount === 1;
            const isDisabledInWL = isWalterLieth;
            const isUnavailable =
              props.variables !== undefined && key !== "tavg" && !storeVarSet.has(key);
            return (
              <div
                key={key}
                title={isDisabledInWL ? t("chart.walterLiethTabUnavailable") : undefined}
                className={
                  isLastActive || isDisabledInWL || isUnavailable
                    ? "pointer-events-none cursor-not-allowed opacity-40"
                    : ""
                }
              >
                <FilterChip
                  label={label}
                  isActive={visible[key] && !isDisabledInWL && !isUnavailable}
                  onClick={() => handleToggle(key)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {isWalterLieth && !chart.isCompare ? (
        <WalterLiethChart
          chartData={chart.chartDataSingle}
          scales={chart.scales}
          summary={chart.summary}
          {...(props.altitude !== undefined ? { altitude: props.altitude } : {})}
        />
      ) : isWalterLieth && props.compareMode === "periods" ? (
        <WalterLiethPeriodsLayout
          chartDataA={chart.chartDataA}
          chartDataB={chart.chartDataB}
          scales={chart.scales}
          labelA={props.labelA ?? ""}
          labelB={props.labelB ?? ""}
          summaryA={chart.summaryA}
          summaryB={chart.summaryB}
        />
      ) : isWalterLieth ? (
        <WalterLiethCitiesLayout
          chartDataA={chart.chartDataA}
          chartDataB={chart.chartDataB}
          labelA={props.labelA ?? ""}
          labelB={props.labelB ?? ""}
          scales={chart.scales}
          summaryA={chart.summaryA}
          summaryB={chart.summaryB}
        />
      ) : chart.isMultiPeriod ? (
        <MultiPeriodChart
          chartData={chart.chartData}
          multiPeriodData={props.multiPeriodData ?? []}
          visible={visible}
          scales={chart.scales}
          rightMax={chart.rightMax}
          {...(props.selectedMonths !== undefined ? { selectedMonths: props.selectedMonths } : {})}
          {...(props.periodColors !== undefined ? { periodColors: props.periodColors } : {})}
          {...(props.hiddenPeriods !== undefined ? { hiddenPeriods: props.hiddenPeriods } : {})}
        />
      ) : chart.isCompare ? (
        <CompareChart
          chartData={chart.chartData}
          visible={visible}
          scales={chart.scales}
          rightMax={chart.rightMax}
          showAridity={showAridity}
          aridityA={chart.aridityA}
          {...(props.labelA !== undefined ? { labelA: props.labelA } : {})}
          {...(props.labelB !== undefined ? { labelB: props.labelB } : {})}
          {...(props.selectedMonths !== undefined ? { selectedMonths: props.selectedMonths } : {})}
        />
      ) : (
        <StandardClimateChart
          chartData={chart.chartData}
          aridity={chart.aridity}
          scales={chart.scales}
          rightMax={chart.rightMax}
          summary={chart.summary}
          visible={visible}
          showAridity={showAridity}
          {...(props.selectedMonths !== undefined ? { selectedMonths: props.selectedMonths } : {})}
          {...(props.altitude !== undefined ? { altitude: props.altitude } : {})}
        />
      )}
    </div>
  );
}
