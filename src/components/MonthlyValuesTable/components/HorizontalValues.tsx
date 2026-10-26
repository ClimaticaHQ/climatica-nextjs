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
import { RowHeaders } from "./RowHeaders";
import { UnitLabel } from "./UnitLabel";
import { ValueStack } from "./ValueStack";

/**
 * The table under a plot, in the plot's own geometry: the label column is the plot's left
 * margin, a spacer the right one, and one column per month exactly under that month. Under a
 * scrolling overlay it takes the plot's width and scroll, its labels held like the y axis. The
 * standard overlay's: each unit a section label over its rows, headed by the series' short labels.
 */
export function HorizontalValues({
  rows,
  caption,
  isCompact,
  markers,
  flashKeys,
  isScrolling,
  hasSections,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: THorizontalValuesProps) {
  const t = useTranslations();
  const scroll = useContext(ChartScrollContext);
  const { isNarrow } = useContext(ChartDeviceContext);
  // * the plot's own margins (its axes) — the frame's border given back, so the months line up
  // * exactly
  const margin = getPlotMargin(isCompact, isNarrow) - MONTHLY_VALUES_BORDER;
  const months = rows[0]?.cells ?? [];
  const fixed = scroll ? C.UNIT_FIXED : "";
  // * the hovered month: one band from the table's top edge to its bottom — every row's cell
  // * (section labels too), the divider between groups painted in the band's colour
  const bandStyle = (i: number, hasDivider: boolean) =>
    i === activeMonthIndex
      ? {
          backgroundColor: MONTHLY_VALUES_HOVER,
          ...(hasDivider ? { borderTopColor: MONTHLY_VALUES_HOVER } : {}),
        }
      : undefined;
  const cellProps = (i: number, hasDivider: boolean) => ({
    tabIndex: 0,
    className: `${C.VALUE} ${hasDivider ? C.ROW_DIVIDER : ""}`,
    style: bandStyle(i, hasDivider),
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
            {rows.flatMap((row, r) => {
              const divider = r > 0 ? C.ROW_DIVIDER : undefined;
              const isValuesDivided = !hasSections && r > 0;
              const values = (
                <tr key={row.variable} className={hasSections ? undefined : divider}>
                  <th scope="row" className={`${hasSections ? C.HEADERS_CELL : C.UNIT} ${fixed}`}>
                    {hasSections ? (
                      <RowHeaders row={row} markers={markers} keys={flashKeys} />
                    ) : (
                      <UnitLabel row={row} markers={markers} />
                    )}
                  </th>
                  {row.cells.map((entries, i) => (
                    <td key={i} {...cellProps(i, isValuesDivided)}>
                      <ValueStack entries={entries} className={C.STACK} />
                    </td>
                  ))}
                  <td />
                </tr>
              );
              if (!hasSections) return [values];
              // * the unit over the header column only; screen readers get it in the row's header
              return [
                <tr key={`${row.variable}-unit`} aria-hidden className={divider}>
                  <td className={`${C.SECTION} ${fixed}`} style={{ color: row.unitColor }}>
                    {row.unit}
                  </td>
                  {months.map((_, i) => (
                    <td
                      key={i}
                      className={`${C.SECTION_MONTH} ${r > 0 ? C.ROW_DIVIDER : ""}`}
                      style={bandStyle(i, r > 0)}
                    />
                  ))}
                  <td />
                </tr>,
                values,
              ];
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
