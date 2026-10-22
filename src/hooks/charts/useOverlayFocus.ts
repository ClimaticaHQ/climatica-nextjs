import { seriesDataKey } from "@/components/charts/charts.util";
import type { TTooltipFocus, TUseOverlayFocusArgs } from "@/components/charts/charts.type";
import { MISSING_VALUE_LABEL, TOOLTIP_DIGITS, VALUE_DIGITS } from "@/constants";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import type { TOverlayFocus } from "@/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

/**
 * The overlay's hovered curve or bar (or tapped, on touch), or an entity's marker in the values
 * table, and the tooltip line naming a curve or bar at the hovered month: "Mean temperature ·
 * Rome — July 27.0 °C", "Rome — October 105 mm (humid period)".
 */
export function useOverlayFocus({ entries, rows, lines, activeMonthIndex }: TUseOverlayFocusArgs) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const [focus, setFocus] = useState<TOverlayFocus | null>(null);

  function describe(current: TOverlayFocus, monthIndex: number): TTooltipFocus | null {
    const entry = entries.find(({ id }) => id === current.id);
    const row = rows[monthIndex];
    if (!entry || !row || current.target === "entity") return null;
    const key = current.target === "bar" ? "prec" : current.variable;
    const raw = row[seriesDataKey(entry.id, key)];
    const number = typeof raw === "number" ? raw : null;
    const month = t(`months.${monthIndex + 1}`);
    if (current.target === "bar") {
      const isArid = entry.aridityByMonth?.[monthIndex + 1] === true;
      const value =
        number === null
          ? MISSING_VALUE_LABEL
          : t("units.mmValue", { value: formatNumber(number, { digits: VALUE_DIGITS.PREC }) });
      const period = t(isArid ? "chart.focusArid" : "chart.focusHumid");
      return {
        text: t("chart.focusBar", { entity: entry.label, month, value, period }),
        marker: { ...entry.marker, hatch: entry.hatch },
      };
    }
    const line = lines.find(({ variable }) => variable === current.variable);
    const value =
      number === null
        ? MISSING_VALUE_LABEL
        : t("units.celsiusValue", {
            value: formatNumber(number, { digits: TOOLTIP_DIGITS.STANDARD }),
          });
    return {
      text: t("chart.focusCurve", {
        variable: line ? t(line.labelKey) : "",
        entity: entry.label,
        month,
        value,
      }),
      marker: entry.marker,
    };
  }

  const tooltipFocus =
    focus !== null && activeMonthIndex !== null ? describe(focus, activeMonthIndex) : null;
  return { focus, setFocus, tooltipFocus };
}
