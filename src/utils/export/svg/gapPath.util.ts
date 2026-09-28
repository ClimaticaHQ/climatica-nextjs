import { catmullRomPath } from "@/components/TempPrecipChart/utils/catmullRomPath";
import type { TExportPoint } from "@/types";

/**
 * A curve that breaks at missing months (null points) instead of bridging them — the export
 * twin of Recharts' default gap. Each contiguous run becomes its own subpath.
 */
export function buildGapAwarePath(points: readonly (TExportPoint | null)[]): string {
  const runs: TExportPoint[][] = [[]];
  points.forEach((point) => {
    if (point === null) runs.push([]);
    else runs[runs.length - 1].push(point);
  });
  return runs
    .filter((run) => run.length > 0)
    .map((run) => catmullRomPath(run))
    .join(" ");
}
