import {
  PAIR_SHAPE_POSITION,
  SERIES_HATCH_GEOMETRY as H,
  SERIES_HATCHES,
  SERIES_SHAPE_GEOMETRY as G,
  SERIES_SHAPES,
} from "@/constants";
import type { EWalterLiethSeriesId } from "@/enums";
import type {
  TEntityMarker,
  THatchTile,
  TMarkerPathArgs,
  TMarkerSlots,
  TSeriesHatch,
  TSeriesShape,
} from "@/types";

export function getSeriesShape(position: number): TSeriesShape {
  return SERIES_SHAPES[Math.max(position, 0) % SERIES_SHAPES.length] ?? SERIES_SHAPES[0];
}

export function getPairShape(side: EWalterLiethSeriesId): TSeriesShape {
  return getSeriesShape(PAIR_SHAPE_POSITION[side]);
}

export function getSeriesHatch(position: number): TSeriesHatch {
  return SERIES_HATCHES[Math.max(position, 0) % SERIES_HATCHES.length] ?? SERIES_HATCHES[0];
}

export function getPairHatch(side: EWalterLiethSeriesId): TSeriesHatch {
  return getSeriesHatch(PAIR_SHAPE_POSITION[side]);
}

export function getEntityMarker(markerSlot: number): TEntityMarker {
  return { markerSlot, shape: getSeriesShape(markerSlot), hatch: getSeriesHatch(markerSlot) };
}

export const getPairMarker = (side: EWalterLiethSeriesId) =>
  getEntityMarker(PAIR_SHAPE_POSITION[side]);

export function assignMarkerSlots(saved: TMarkerSlots, keys: readonly string[]): TMarkerSlots {
  const kept = keys.filter((key) => saved[key] !== undefined);
  const slots: Record<string, number> = {};
  const taken = new Set<number>();
  for (const key of kept) {
    const slot = saved[key] ?? 0;
    if (taken.has(slot)) continue;
    slots[key] = slot;
    taken.add(slot);
  }
  let next = 0;
  for (const key of keys) {
    if (slots[key] !== undefined) continue;
    while (taken.has(next)) next += 1;
    slots[key] = next;
    taken.add(next);
  }
  return slots;
}

export const isListOrder = (slots: TMarkerSlots, keys: readonly string[]) =>
  keys.every((key, index) => slots[key] === index);

const polygon = (points: readonly (readonly [number, number])[]) =>
  `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;

const SHAPE_PATHS: Record<TSeriesShape, (args: TMarkerPathArgs) => string> = {
  circle: ({ cx, cy, size }) => {
    const r = size / 2;
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${size} 0a${r} ${r} 0 1 0 ${-size} 0Z`;
  },
  square: ({ cx, cy, size }) => {
    const h = (size * G.SQUARE_SIDE) / 2;
    return polygon([
      [cx - h, cy - h],
      [cx + h, cy - h],
      [cx + h, cy + h],
      [cx - h, cy + h],
    ]);
  },
  triangle: ({ cx, cy, size }) => {
    const h = size * G.TRIANGLE_HEIGHT;
    return polygon([
      [cx, cy - h / 2],
      [cx + size / 2, cy + h / 2],
      [cx - size / 2, cy + h / 2],
    ]);
  },
  diamond: ({ cx, cy, size }) => {
    const r = size * G.DIAMOND_RADIUS;
    return polygon([
      [cx, cy - r],
      [cx + r, cy],
      [cx, cy + r],
      [cx - r, cy],
    ]);
  },
  cross: ({ cx, cy, size }) => {
    const r = size / 2;
    const a = (size * G.CROSS_ARM) / 2;
    return polygon([
      [cx - a, cy - r],
      [cx + a, cy - r],
      [cx + a, cy - a],
      [cx + r, cy - a],
      [cx + r, cy + a],
      [cx + a, cy + a],
      [cx + a, cy + r],
      [cx - a, cy + r],
      [cx - a, cy + a],
      [cx - r, cy + a],
      [cx - r, cy - a],
      [cx - a, cy - a],
    ]);
  },
};

export function getMarkerPath(args: TMarkerPathArgs): string {
  return SHAPE_PATHS[args.shape](args);
}

const T = H.TILE;
const HATCH_TILES: Record<TSeriesHatch, THatchTile | null> = {
  solid: null,
  // * corner to corner, plus the two corner stubs, so the lines run on across tiles
  diagonal: {
    d: `M0 ${T}L${T} 0M${-T / 4} ${T / 4}L${T / 4} ${-T / 4}M${(3 * T) / 4} ${(5 * T) / 4}L${(5 * T) / 4} ${(3 * T) / 4}`,
    paint: "stroke",
  },
  dots: {
    d: getMarkerPath({ shape: "circle", cx: T / 2, cy: T / 2, size: H.DOT_RADIUS * 2 }),
    paint: "fill",
  },
  horizontal: { d: `M0 ${T / 2}L${T} ${T / 2}`, paint: "stroke" },
  cross: { d: `M0 0L${T} ${T}M0 ${T}L${T} 0`, paint: "stroke" },
};

export function getHatchTile(hatch: TSeriesHatch): THatchTile | null {
  return HATCH_TILES[hatch];
}
