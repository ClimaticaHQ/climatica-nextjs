"use client";

import { Card } from "@/components/Card";
import { CLIMATE_PERIOD_LABELS, CLIMATE_PERIODS, INFO_SECTION_IDS } from "@/constants";
import { ECardPadding, ECardSize, EDisplayMetric } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui";
import type { TResolutionRow } from "@/types";
import { getResolutionRows } from "@/utils/info.util";
import { useTranslations } from "next-intl";
import { INFO_CLASSES as C } from "../info.constant";
import { InfoSection } from "./InfoSection";

export function ResolutionsTable() {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const periodCount = Object.values(CLIMATE_PERIODS).length;
  const availability = ({ climatePeriods, hasWeather }: TResolutionRow) =>
    climatePeriods.length === periodCount && hasWeather
      ? t("info.data.resolutions.everywhere")
      : t("info.data.resolutions.onlyFor", {
          periods: climatePeriods.map((period) => CLIMATE_PERIOD_LABELS[period]).join(", "),
        });

  return (
    <InfoSection id={INFO_SECTION_IDS.RESOLUTIONS} intro={t("info.data.resolutions.intro")}>
      <Card size={ECardSize.MD} padding={ECardPadding.NONE} shouldClip>
        <div className={C.TABLE_SCROLL}>
          <table className={C.TABLE}>
            <caption className="sr-only">{t("info.data.resolutions.caption")}</caption>
            <thead>
              <tr>
                <th scope="col" className={C.TH}>
                  {t("info.data.resolutions.resolution")}
                </th>
                <th scope="col" className={C.TH}>
                  {t("info.data.resolutions.cellSize")}
                </th>
                <th scope="col" className={C.TH}>
                  {t("info.data.resolutions.availability")}
                </th>
              </tr>
            </thead>
            <tbody>
              {getResolutionRows().map((row) => (
                <tr key={row.size}>
                  <th scope="row" className={`${C.TD} font-medium text-[var(--color-text)]`}>
                    {t(`cellSizesShort.${row.size.replace(".", "_")}`)}
                  </th>
                  <td className={`${C.TD} ${C.NUMERIC}`}>
                    {t("info.data.resolutions.km", {
                      value: formatValue(row.cellSizeKm, { metric: EDisplayMetric.CELL_SIZE_KM }),
                    })}
                  </td>
                  <td className={C.TD}>{availability(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </InfoSection>
  );
}
