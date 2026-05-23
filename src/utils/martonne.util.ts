import { TMartonneBadge } from "@/types";

const MARTONNE_THRESHOLDS = [
  {
    threshold: 5,
    badge: { labelKey: "chart.martonneClass.hyperarid", bg: "#f8d7da", color: "#842029" },
  },
  {
    threshold: 10,
    badge: { labelKey: "chart.martonneClass.arid", bg: "#fde8d0", color: "#7d3c00" },
  },
  {
    threshold: 20,
    badge: { labelKey: "chart.martonneClass.semiArid", bg: "#fff3cd", color: "#664d03" },
  },
  {
    threshold: 30,
    badge: { labelKey: "chart.martonneClass.subHumid", bg: "#d1f0e0", color: "#0a4d2e" },
  },
  {
    threshold: 35,
    badge: { labelKey: "chart.martonneClass.humid", bg: "#cfe2ff", color: "#084298" },
  },
  {
    threshold: Infinity,
    badge: { labelKey: "chart.martonneClass.perhumid", bg: "#e2d9f3", color: "#3d1a78" },
  },
] as const;

export function getMartonneBadge(martonneIndex: number | null): TMartonneBadge | null {
  if (martonneIndex === null || isNaN(martonneIndex)) return null;

  return MARTONNE_THRESHOLDS.find(({ threshold }) => martonneIndex < threshold)?.badge ?? null;
}
