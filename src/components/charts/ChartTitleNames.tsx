import { useTranslations } from "next-intl";
import type { TChartTitleNamesProps } from "./charts.type";
import { CHART_TITLE_CLASSES as C } from "./charts.constant";

export function ChartTitleNames({ names }: TChartTitleNamesProps) {
  const t = useTranslations();
  const [nameA, nameB] = names;
  const versus = t("chart.versus");
  const full = nameB !== undefined ? `${nameA} ${versus} ${nameB}` : nameA;
  if (!nameA && nameB === undefined) return null;

  return nameB !== undefined ? (
    <h3 title={full} className={`${C.HEADING} ${C.PAIR}`}>
      <span className={C.NAME_A}>{nameA}</span>
      <span className={C.VERSUS}>{versus}</span>
      <span className={C.NAME_B}>{nameB}</span>
    </h3>
  ) : (
    <h3 title={full} className={`${C.HEADING} ${C.SINGLE}`}>
      {nameA}
    </h3>
  );
}
