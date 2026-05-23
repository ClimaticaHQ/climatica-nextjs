import type { TCompareStats } from "@/types";

export type TCompareStatsGridProps = {
  labelA: string;
  labelB: string;
  statsA: TCompareStats;
  statsB: TCompareStats;
  altitudeA?: number | null;
  altitudeB?: number | null;
  activeColumn?: number | undefined;
};
