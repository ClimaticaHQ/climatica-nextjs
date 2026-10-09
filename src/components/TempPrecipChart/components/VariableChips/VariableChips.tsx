import { Chip } from "@/components/UI/Chip";
import { ChipScroller } from "@/components/CompareYears/ChipScroller";
import type { TVisibleSeries } from "@/types";
import { useTranslations } from "next-intl";
import type { TVariableChipsProps } from "../../TempPrecipChart.type";

/**
 * The standard chart's variable toggles. The last active one stays on — locked, as in the
 * sidebar: not-allowed cursor, announced as disabled; a variable the store didn't fetch is shown
 * off and disabled (tavg is derived, so always available).
 */
export function VariableChips({
  visible,
  variables,
  onChange,
  isScrollRow = false,
}: TVariableChipsProps) {
  const t = useTranslations();
  const activeCount = Object.values(visible).filter(Boolean).length;
  const storeVarSet = new Set<string>(variables ?? []);
  const chips: { key: keyof TVisibleSeries; label: string }[] = [
    { key: "tmax", label: t("sidebar.variables.tmax") },
    { key: "tmin", label: t("sidebar.variables.tmin") },
    { key: "tavg", label: t("sidebar.variables.tavg") },
    { key: "prec", label: t("sidebar.variables.prec") },
  ];

  const handleToggle = (key: keyof TVisibleSeries) =>
    onChange({ ...visible, [key]: !visible[key] });

  const items = chips.map(({ key, label }) => {
    const isLastActive = visible[key] && activeCount === 1;
    const isUnavailable = variables !== undefined && key !== "tavg" && !storeVarSet.has(key);
    return (
      <div key={key} className="shrink-0">
        <Chip
          label={label}
          isActive={visible[key] && !isUnavailable}
          disabled={isUnavailable}
          isLocked={isLastActive}
          onClick={() => handleToggle(key)}
        />
      </div>
    );
  });

  return isScrollRow ? (
    <ChipScroller contentKey="variables">{items}</ChipScroller>
  ) : (
    <div className="flex flex-wrap justify-end gap-2">{items}</div>
  );
}
