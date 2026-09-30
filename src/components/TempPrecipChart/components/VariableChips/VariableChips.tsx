import { FilterChip } from "@/components";
import type { TVisibleSeries } from "@/types";
import { useTranslations } from "next-intl";
import type { TVariableChipsProps } from "../../TempPrecipChart.type";

/**
 * The standard chart's variable toggles. The last active one can't be switched off; a variable
 * the store didn't fetch is shown off and disabled (tavg is derived, so always available).
 */
export function VariableChips({ visible, variables, onChange }: TVariableChipsProps) {
  const t = useTranslations();
  const activeCount = Object.values(visible).filter(Boolean).length;
  const storeVarSet = new Set<string>(variables ?? []);
  const chips: { key: keyof TVisibleSeries; label: string }[] = [
    { key: "tmax", label: t("sidebar.variables.tmax") },
    { key: "tmin", label: t("sidebar.variables.tmin") },
    { key: "tavg", label: t("sidebar.variables.tavg") },
    { key: "prec", label: t("sidebar.variables.prec") },
  ];

  function handleToggle(key: keyof TVisibleSeries) {
    if (visible[key] && activeCount === 1) return;
    onChange({ ...visible, [key]: !visible[key] });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {chips.map(({ key, label }) => {
        const isLastActive = visible[key] && activeCount === 1;
        const isUnavailable = variables !== undefined && key !== "tavg" && !storeVarSet.has(key);
        return (
          <div
            key={key}
            className={
              isLastActive || isUnavailable
                ? "pointer-events-none cursor-not-allowed opacity-40"
                : ""
            }
          >
            <FilterChip
              label={label}
              isActive={visible[key] && !isUnavailable}
              onClick={() => handleToggle(key)}
            />
          </div>
        );
      })}
    </div>
  );
}
