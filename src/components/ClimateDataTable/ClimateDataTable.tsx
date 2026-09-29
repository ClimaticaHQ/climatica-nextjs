import { useMonthlyTableLabels } from "@/hooks";
import { buildMonthlyTableRows, getMonthlyTableRowLabel } from "@/utils";
import { useTranslations } from "next-intl";
import {
  TABLE_ACTIVE_CELL_STYLE,
  TABLE_CELL_BORDER,
  TABLE_CLASSES as C,
  TABLE_GEOMETRY as G,
} from "./ClimateDataTable.constant";
import type { TClimateDataTableProps } from "./ClimateDataTable.type";
import { TableRowHeader } from "./components";

/**
 * Monthly values under a chart — the chart's text alternative. One series (city page) or
 * several (compare pages): rows grouped by variable, each labelled with its series.
 */
export function ClimateDataTable({
  series,
  variables,
  caption,
  activeMonthIndex,
  onMonthHover,
}: TClimateDataTableProps) {
  const t = useTranslations();
  const labels = useMonthlyTableLabels();
  const rows = buildMonthlyTableRows({ series, variables, labels });
  const months = series[0]?.data ?? [];
  const labelWidth = series.length > 1 ? G.LABEL_COL_WIDTH.MULTI : G.LABEL_COL_WIDTH.SINGLE;

  const cellProps = (i: number) => ({
    style: {
      borderLeft: TABLE_CELL_BORDER,
      ...(i === activeMonthIndex ? TABLE_ACTIVE_CELL_STYLE : {}),
    },
    onMouseEnter: () => onMonthHover?.(i),
    onMouseLeave: () => onMonthHover?.(null),
  });

  return (
    <div className={C.FRAME} style={{ border: TABLE_CELL_BORDER }}>
      <table
        className={C.TABLE}
        style={{ minWidth: labelWidth + months.length * G.MIN_MONTH_COL_WIDTH }}
      >
        <caption className={C.CAPTION}>{caption}</caption>
        <colgroup>
          <col style={{ width: labelWidth }} />
          {months.map((month) => (
            <col key={month.month} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: TABLE_CELL_BORDER }}>
            <td className={`${C.CORNER} ${C.STICKY}`} />
            {months.map((month, i) => (
              <th key={month.month} scope="col" className={C.MONTH} {...cellProps(i)}>
                {t(`months.${month.month}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.key} style={ri > 0 ? { borderTop: TABLE_CELL_BORDER } : undefined}>
              <TableRowHeader label={getMonthlyTableRowLabel(row)} marker={row.marker} />
              {row.values.map((value, i) => (
                <td key={months[i]?.month ?? i} className={C.VALUE} {...cellProps(i)}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
