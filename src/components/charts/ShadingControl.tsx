import { SegmentedControl, type TSegmentedOption } from "@/components/SegmentedControl";
import { SeriesMarker } from "@/components/SeriesMarker";
import { NoShadingIcon } from "@/components/svg";
import { EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";
import { getPairShape } from "@/utils/seriesShape.util";
import { useTranslations } from "next-intl";
import type { TShadingControlProps } from "./charts.type";

const SHADING_BY_SERIES = {
  [EWalterLiethSeriesId.A]: EWalterLiethShading.A,
  [EWalterLiethSeriesId.B]: EWalterLiethShading.B,
} satisfies Record<EWalterLiethSeriesId, EWalterLiethShading>;

/** Which series gets the humid/arid hatching in overlay: A, B or none. */
export function ShadingControl({ seriesA, seriesB, shading, onChange }: TShadingControlProps) {
  const t = useTranslations();
  // * each option shades its own series, whichever side the page lists it on
  const options: TSegmentedOption<EWalterLiethShading>[] = [
    ...[seriesA, seriesB].map((series) => ({
      value: SHADING_BY_SERIES[series.id],
      label: series.label,
      icon: <SeriesMarker shape={series.shape ?? getPairShape(series.id)} />,
    })),
    { value: EWalterLiethShading.NONE, label: t("chart.wlShadingNone"), icon: <NoShadingIcon /> },
  ];

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {t("chart.wlShading")}
      </span>
      <SegmentedControl
        label={t("chart.wlShading")}
        options={options}
        value={shading}
        onChange={onChange}
      />
    </div>
  );
}
