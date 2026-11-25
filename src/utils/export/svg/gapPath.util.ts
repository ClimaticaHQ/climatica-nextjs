import { catmullRomPath } from "@/utils/catmullRomPath.util";
import type { TExportPoint } from "@/types";

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
