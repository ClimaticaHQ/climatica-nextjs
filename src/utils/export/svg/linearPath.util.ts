/** Straight line segments between points — the WL counterpart to catmullRomPath. */
export function linearPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  const segments = rest.map((p) => `L ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return `M ${first.x.toFixed(2)},${first.y.toFixed(2)} ${segments}`;
}
