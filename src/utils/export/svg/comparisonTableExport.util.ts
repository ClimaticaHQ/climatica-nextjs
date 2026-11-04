import { DIFFERENCE_DIRECTION_SEPARATOR } from "@/constants";
import type { TComparisonTableValue, TExportComparisonTableArgs } from "@/types";
import { getPairShape } from "@/utils";
import { buildExportTableSvg } from "./exportTable.util";

/** A value, its De Martonne class after it in plain text: "37.3 (Very humid)". */
const withClass = (value: TComparisonTableValue, classLabel: string | null) =>
  value.badge && classLabel !== null ? `${value.text} (${classLabel})` : value.text;

/**
 * The pair's stats table, in the export table style: metric | A | B | difference, the series'
 * shapes in the heads and the difference's direction under its head.
 */
export function buildComparisonTableSvg({
  table,
  labels,
  top,
  left,
  width,
  colors,
}: TExportComparisonTableArgs) {
  const { seriesA, seriesB } = table;
  return buildExportTableSvg({
    columns: [
      { label: seriesA.label, shape: getPairShape(seriesA.id) },
      { label: seriesB.label, shape: getPairShape(seriesB.id) },
      {
        label: labels.difference,
        subtitle: `${table.minuend}${DIFFERENCE_DIRECTION_SEPARATOR}${table.subtrahend}`,
        isMuted: true,
      },
    ],
    rows: table.rows.map((row) => {
      const isMartonne = row.metric === "martonne";
      return {
        label: labels.metrics[row.metric],
        cells: [
          withClass(row.a, isMartonne ? labels.martonneClasses.a : null),
          withClass(row.b, isMartonne ? labels.martonneClasses.b : null),
          row.difference ?? "",
        ],
      };
    }),
    top,
    left,
    width,
    colors,
  });
}
