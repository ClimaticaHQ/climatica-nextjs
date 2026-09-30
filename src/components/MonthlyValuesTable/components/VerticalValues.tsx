import { Card } from "@/components/Card";
import { ECardPadding, ECardSize } from "@/enums";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { MONTHLY_VALUES_CLASSES as C, MONTHLY_VALUES_HOVER } from "../MonthlyValuesTable.constant";
import type { TMonthlyValuesVariantProps } from "../MonthlyValuesTable.type";
import { UnitLabel } from "./UnitLabel";
import { ValueStack } from "./ValueStack";

/**
 * Below `sm` twelve columns don't fit: a "Show monthly values" button (closed by default)
 * reveals the same table on its side — Month | °C | mm, the same cells.
 */
export function VerticalValues({
  rows,
  caption,
  flashKeys,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: TMonthlyValuesVariantProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const tableId = useId();
  const months = rows[0]?.cells ?? [];

  return (
    <div className={C.DISCLOSURE}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={tableId}
        onClick={() => setIsOpen((open) => !open)}
        className={C.DISCLOSURE_BUTTON}
      >
        {t(isOpen ? "chart.hideMonthlyValues" : "chart.showMonthlyValues")}
      </button>
      {isOpen && (
        <Card
          size={ECardSize.SM}
          padding={ECardPadding.NONE}
          flashKeys={flashKeys}
          shouldClip
          className={C.VERTICAL_FRAME}
        >
          <table id={tableId} className={C.VERTICAL_TABLE}>
            <caption className={C.SR_ONLY}>{caption}</caption>
            <thead>
              <tr>
                <th scope="col" className={C.VERTICAL_MONTH}>
                  {t("chart.month")}
                </th>
                {rows.map((row) => (
                  <th key={row.variable} scope="col" className={C.VERTICAL_HEAD}>
                    <UnitLabel row={row} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((_, i) => (
                <tr
                  key={i}
                  className={C.ROW_DIVIDER}
                  style={
                    i === activeMonthIndex ? { backgroundColor: MONTHLY_VALUES_HOVER } : undefined
                  }
                >
                  <th scope="row" className={C.VERTICAL_MONTH}>
                    {t(`months.${i + 1}`)}
                  </th>
                  {rows.map((row) => (
                    <td
                      key={row.variable}
                      tabIndex={0}
                      className={C.VERTICAL_VALUE}
                      onFocus={() => onActiveMonthIndexChange?.(i)}
                      onBlur={() => onActiveMonthIndexChange?.(null)}
                    >
                      <ValueStack entries={row.cells[i] ?? []} className={C.VERTICAL_STACK} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
