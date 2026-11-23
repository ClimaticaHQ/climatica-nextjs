"use client";

import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { NestedCellsIllustration } from "@/components/svg";
import {
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  FULL_VARIABLES_CLIMATE_PERIOD,
  INFO_SECTION_IDS as ID,
  PERIOD_RESTRICTED_VARIABLES,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
  WEATHER_VARIABLES,
} from "@/constants";
import { ECardBackground, ECardSize } from "@/enums";
import { useDataPage } from "@/hooks/pages/useDataPage";
import { getReferenceLink } from "@/utils/info.util";
import { useTranslations } from "next-intl";
import { INDICATORS_FIGURE } from "../figures/figures.constant";
import {
  BOLZANO_EXAMPLE as B,
  CLIMATE_INDICATORS,
  INFO_CLASSES as C,
  NESTED_CELLS_FINE_PER_COARSE,
  REFERENCES,
} from "../info.constant";
import { InfoCardGrid } from "../parts/InfoCardGrid";
import { InfoFigure } from "../figures/InfoFigure";
import { InfoList } from "../parts/InfoList";
import { LazyIndicatorsFigureChart } from "../figures/LazyFigureCharts";
import { InfoSection } from "../parts/InfoSection";
import { ResolutionsTable } from "../parts/ResolutionsTable";

/** Data & methods: what a value describes (its raster cell's, not the point's), the grids, periods, variables and indicators. */
export function DataPage() {
  const t = useTranslations();
  const { arcLabel, elevation, temperature, cellLabel, variableNames } = useDataPage();

  return (
    <>
      <PageHeader
        title={t("info.pages.data.title")}
        description={t("info.pages.data.description")}
      />
      <div className={C.COLUMN}>
        <InfoSection id={ID.CELL_VALUES}>
          <div className={C.CELL_LAYOUT}>
            <div className={C.CELL_TEXT}>
              <p className={C.TEXT}>{t("info.data.cell.whole")}</p>
              <p className={C.TEXT}>{t("info.data.cell.mixed")}</p>
              <p className={C.TEXT}>
                {t("info.data.cell.example", {
                  period: CLIMATE_PERIOD_LABELS[B.PERIOD],
                  valleyElevation: elevation(B.VALLEY_ELEVATION),
                  coarseGrid: arcLabel(B.COARSE.grid),
                  coarseElevation: elevation(B.COARSE.elevation),
                  coarseTemperature: temperature(B.COARSE.temperature),
                  fineGrid: arcLabel(B.FINE.grid),
                  fineElevation: elevation(B.FINE.elevation),
                  fineTemperature: temperature(B.FINE.temperature),
                })}
              </p>
              <Card size={ECardSize.MD} background={ECardBackground.HIGHLIGHT}>
                <p className="font-semibold text-[var(--color-text)]">
                  {t("info.data.cell.calloutTitle")}
                </p>
                <p className="text-[var(--color-text)]">{t("info.data.cell.calloutText")}</p>
              </Card>
            </div>
            <figure className={C.CELL_FIGURE}>
              <NestedCellsIllustration
                ariaLabel={t("info.data.cell.illustrationLabel", {
                  coarse: cellLabel(B.COARSE.grid),
                  fine: cellLabel(B.FINE.grid),
                })}
                coarseLabel={cellLabel(B.COARSE.grid)}
                fineLabel={cellLabel(B.FINE.grid)}
                finePerCoarse={NESTED_CELLS_FINE_PER_COARSE}
              />
              <figcaption className={`${C.SMALL} ${C.CELL_CAPTION}`}>
                {t("info.data.cell.illustrationCaption")}
              </figcaption>
            </figure>
          </div>
        </InfoSection>
        <ResolutionsTable />
        <InfoSection id={ID.PERIODS}>
          <InfoCardGrid
            columns={2}
            items={[
              {
                key: "climate",
                title: t("sidebar.datasets.climate"),
                text: t("info.data.periods.climateIntro"),
                body: (
                  <>
                    <ul className={C.LIST_SMALL}>
                      {Object.values(CLIMATE_PERIODS).map((period) => (
                        <li key={period}>
                          <span className={C.PERIOD_LABEL}>{CLIMATE_PERIOD_LABELS[period]}</span>
                          {" — "}
                          {t(
                            period === FULL_VARIABLES_CLIMATE_PERIOD
                              ? "info.data.periods.fromWorldClim"
                              : "info.data.periods.averaged",
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className={C.SMALL}>
                      {t("info.data.periods.climateVariables", {
                        variables: variableNames(CLIMATE_VARIABLES),
                        restricted: variableNames(PERIOD_RESTRICTED_VARIABLES),
                        period: CLIMATE_PERIOD_LABELS[FULL_VARIABLES_CLIMATE_PERIOD],
                      })}
                    </p>
                  </>
                ),
              },
              {
                key: "weather",
                title: t("sidebar.datasets.weather"),
                // * years are labels, never grouped ("1951", not "1,951")
                text: t("info.data.periods.weatherIntro", {
                  first: String(WEATHER_MIN_YEAR),
                  last: String(WEATHER_MAX_YEAR),
                }),
                body: (
                  <p className={C.SMALL}>
                    {t("info.data.periods.weatherVariables", {
                      variables: variableNames(WEATHER_VARIABLES),
                    })}
                  </p>
                ),
              },
            ]}
          />
        </InfoSection>
        <InfoSection id={ID.INDICATORS} intro={t("info.data.indicators.intro")}>
          <InfoCardGrid
            columns={1}
            items={CLIMATE_INDICATORS.map(({ key, formula }) => ({
              key,
              title: t(`info.data.indicators.${key}.title`),
              formula,
              text: t(`info.data.indicators.${key}.text`),
            }))}
          />
          <InfoFigure
            visual={<LazyIndicatorsFigureChart />}
            annotations={INDICATORS_FIGURE.ANNOTATIONS}
            place={INDICATORS_FIGURE.PLACE}
          />
        </InfoSection>
        <InfoSection id={ID.REFERENCES}>
          <InfoList
            isNumbered
            items={REFERENCES.map((reference) => {
              const link = getReferenceLink(reference);
              return { key: reference.key, text: reference.text, ...(link ? { link } : {}) };
            })}
          />
        </InfoSection>
      </div>
    </>
  );
}
