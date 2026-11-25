import { Card } from "@/components/Card";
import { ECardPadding, ECardSize } from "@/enums";
import { getPlotMargin } from "@/utils";
import { ChartDeviceContext } from "@/components/charts/chartDevice.context";
import { ChartScrollContext } from "@/components/charts/chartScroll.context";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import {
  MONTHLY_VALUES_BORDER,
  MONTHLY_VALUES_CLASSES as C,
  MONTHLY_VALUES_HOVER,
} from "../MonthlyValuesTable.constant";
import type { THorizontalValuesProps } from "../MonthlyValuesTable.type";
import { UnitLabel } from "./UnitLabel";
import { ValueStack } from "./ValueStack";

export function HorizontalValues({
  rows,
  caption,
  isCompact,
  markers,
  flashKeys,
  isScrolling,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: THorizontalValuesProps) {
  const t = useTranslations();
  const scroll = useContext(ChartScrollContext);
  const { isNarrow, textScale } = useContext(ChartDeviceContext);
  const margin = getPlotMargin({ isCompact, isNarrow, textScale }) - MONTHLY_VALUES_BORDER;
  const months = rows[0]?.cells ?? [];
  const fixed = scroll ? C.UNIT_FIXED : "";
  const cellProps = (i: number, hasDivider: boolean) => ({
    tabIndex: 0,
    className: `${C.VALUE} ${hasDivider ? C.ROW_DIVIDER : ""}`,
    style:
      i === activeMonthIndex
        ? {
            backgroundColor: MONTHLY_VALUES_HOVER,
            ...(hasDivider ? { borderTopColor: MONTHLY_VALUES_HOVER } : {}),
          }
        : undefined,
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
      className={isScrolling ? C.FRAME_SCROLLING : C.FRAME}
    >
      <div
        ref={scroll?.register}
        data-values-scroller={scroll ? "" : undefined}
        className={scroll ? C.SCROLLER : undefined}
      >
        <table className={C.TABLE} style={scroll ? { width: scroll.contentWidth } : undefined}>
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
                <th scope="row" className={`${C.UNIT} ${fixed}`}>
                  <UnitLabel row={row} markers={markers} keys={flashKeys} />
                </th>
                {row.cells.map((entries, i) => (
                  <td key={i} {...cellProps(i, r > 0)}>
                    <ValueStack entries={entries} className={C.STACK} />
                  </td>
                ))}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
