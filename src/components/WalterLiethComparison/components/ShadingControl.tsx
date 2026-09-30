import { SegmentedControl, type TSegmentedOption } from "@/components/SegmentedControl";
import { SeriesMarker } from "@/components/SeriesMarker";
import { NoShadingIcon } from "@/components/svg";
import { EWalterLiethShading } from "@/enums";
import { useTranslations } from "next-intl";
import type { TShadingControlProps } from "../WalterLiethComparison.type";

/** Which series gets the humid/arid hatching in overlay: A, B or none. */
export function ShadingControl({ seriesA, seriesB, shading, onChange }: TShadingControlProps) {
  const t = useTranslations();
  const options: TSegmentedOption<EWalterLiethShading>[] = [
    { value: EWalterLiethShading.A, label: seriesA.label, icon: <SeriesMarker id={seriesA.id} /> },
    { value: EWalterLiethShading.B, label: seriesB.label, icon: <SeriesMarker id={seriesB.id} /> },
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
