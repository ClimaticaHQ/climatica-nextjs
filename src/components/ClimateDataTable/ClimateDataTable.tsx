import { useTranslations } from "next-intl";
import type { TClimateDataTableProps } from "./ClimateDataTable.type";

const CELL_BORDER = "0.5px solid var(--color-border)";
const LABEL_COL_WIDTH = 110;
const ACTIVE_CELL_STYLE = {
  backgroundColor: "var(--color-chip-active-bg)",
  color: "var(--color-chip-active-text)",
};

export function ClimateDataTable({ monthlyData, activeMonthIndex }: TClimateDataTableProps) {
  const t = useTranslations();

  const rows: {
    label: string;
    format: (d: TClimateDataTableProps["monthlyData"][number]) => string;
  }[] = [
    { label: `${t("chart.avgTempShort")} (°C)`, format: (d) => d.tavg.toFixed(1) },
    { label: `${t("chart.precipShort")} (mm)`, format: (d) => Math.round(d.prec).toString() },
  ];

  const dataColWidth =
    monthlyData.length > 0 ? `calc((100% - ${LABEL_COL_WIDTH}px) / ${monthlyData.length})` : "auto";

  return (
    <div
      className="mt-6 overflow-x-auto overflow-hidden rounded-[var(--radius-md)]"
      style={{ border: CELL_BORDER }}
    >
      <table className="w-full min-w-[520px] table-fixed">
        <colgroup>
          <col style={{ width: `${LABEL_COL_WIDTH}px` }} />
          {monthlyData.map((d) => (
            <col key={d.month} style={{ width: dataColWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: CELL_BORDER }}>
            <th className="px-4 py-[10px] text-left text-[11px] text-[var(--color-text-secondary)]" />
            {monthlyData.map((d, i) => (
              <th
                key={d.month}
                className="px-1 py-[10px] text-center text-[11px] text-[var(--color-text-secondary)]"
                style={{
                  borderLeft: CELL_BORDER,
                  ...(i === activeMonthIndex ? ACTIVE_CELL_STYLE : {}),
                }}
              >
                {t(`months.${d.month}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.label} style={ri > 0 ? { borderTop: CELL_BORDER } : undefined}>
              <td className="whitespace-nowrap px-4 py-[10px] text-[11px] text-[var(--color-text-secondary)]">
                {row.label}
              </td>
              {monthlyData.map((d, i) => (
                <td
                  key={d.month}
                  className="px-1 py-[10px] text-center text-[16px] font-medium tabular-nums text-[var(--color-text)]"
                  style={{
                    borderLeft: CELL_BORDER,
                    ...(i === activeMonthIndex ? ACTIVE_CELL_STYLE : {}),
                  }}
                >
                  {row.format(d)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
