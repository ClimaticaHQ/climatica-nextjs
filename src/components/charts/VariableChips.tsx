import { Chip } from "@/components/UI/Chip";
import type { TVisibleSeries } from "@/types";
import { useTranslations } from "next-intl";
import { VARIABLE_CHIPS_ROW_CLASS } from "./charts.constant";
import type { TVariableChipsProps } from "./charts.type";

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

  return <div className={VARIABLE_CHIPS_ROW_CLASS}>{items}</div>;
}
