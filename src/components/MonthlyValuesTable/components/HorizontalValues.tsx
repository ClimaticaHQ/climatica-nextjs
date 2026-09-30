import { Card } from "@/components/Card";
import { ECardPadding, ECardSize } from "@/enums";
import { getPlotMargin } from "@/utils";
import { useTranslations } from "next-intl";
import {
  MONTHLY_VALUES_BORDER,
  MONTHLY_VALUES_CLASSES as C,
  MONTHLY_VALUES_HOVER,
} from "../MonthlyValuesTable.constant";
import type { THorizontalValuesProps } from "../MonthlyValuesTable.type";
import { UnitLabel } from "./UnitLabel";
import { ValueStack } from "./ValueStack";

/**
 * The table under a plot, in the plot's own geometry: the label column is the plot's left
 * margin, a spacer the right one, and one column per month exactly under that month.
 */
export function HorizontalValues({
  rows,
  caption,
  isCompact,
  flashKeys,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: THorizontalValuesProps) {
  const t = useTranslations();
  // * the plot's own margins — the frame's border given back, so the months line up exactly
  const margin = getPlotMargin(isCompact) - MONTHLY_VALUES_BORDER;
  const months = rows[0]?.cells ?? [];
  const cellProps = (i: number) => ({
    tabIndex: 0,
    className: C.VALUE,
    style: i === activeMonthIndex ? { backgroundColor: MONTHLY_VALUES_HOVER } : undefined,
    onMouseEnter: () => onActiveMonthIndexChange?.(i),
    onMouseLeave: () => onActiveMonthIndexChange?.(null),
    onFocus: () => onActiveMonthIndexChange?.(i),
    onBlur: () => onActiveMonthIndexChange?.(null),
  });

  return (
    <Card
      size={ECardSize.SM}
      padding={ECardPadding.NONE}
      flashKeys={flashKeys}
      shouldClip
      className={C.FRAME}
    >
      <table className={C.TABLE}>
        <caption className={C.SR_ONLY}>{caption}</caption>
        <colgroup>
          <col style={{ width: margin }} />
          {months.map((_, i) => (
            <col key={i} />
          ))}
          <col style={{ width: margin }} />
        </colgroup>
        {/* * the plot above labels the months; screen readers get them here */}
        <thead className={C.SR_ONLY}>
          <tr>
            <td />
            {months.map((_, i) => (
              <th key={i} scope="col">
                {t(`months.${i + 1}`)}
              </th>
            ))}
            <td />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.variable} className={r > 0 ? C.ROW_DIVIDER : undefined}>
              <th scope="row" className={C.UNIT}>
                <UnitLabel row={row} />
              </th>
              {row.cells.map((entries, i) => (
                <td key={i} {...cellProps(i)}>
                  <ValueStack entries={entries} className={C.STACK} />
                </td>
              ))}
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
