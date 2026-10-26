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

/** An entity's shape by its place in the list, wrapping past the last; a missing place (-1) gets the first. */
export function getSeriesShape(position: number): TSeriesShape {
  return SERIES_SHAPES[Math.max(position, 0) % SERIES_SHAPES.length] ?? SERIES_SHAPES[0];
}

/** A pair side's shape: A the first place's, B the second's. */
export function getPairShape(side: EWalterLiethSeriesId): TSeriesShape {
  return getSeriesShape(PAIR_SHAPE_POSITION[side]);
}

/** An entity's bar hatch by its place in the list, wrapping like its shape. */
export function getSeriesHatch(position: number): TSeriesHatch {
  return SERIES_HATCHES[Math.max(position, 0) % SERIES_HATCHES.length] ?? SERIES_HATCHES[0];
}

/** A pair side's hatch: A the first place's (solid), B the second's. */
export function getPairHatch(side: EWalterLiethSeriesId): TSeriesHatch {
  return getSeriesHatch(PAIR_SHAPE_POSITION[side]);
}

/**
 * The one mapping from an entity's marker slot to what it draws — chart, chips, tables, legend
 * and export all read the series' marker, never its place in a list.
 */
export function getEntityMarker(markerSlot: number): TEntityMarker {
  return { markerSlot, shape: getSeriesShape(markerSlot), hatch: getSeriesHatch(markerSlot) };
}

/** A pair side's marker: A the first slot's, B the second's. */
export const getPairMarker = (side: EWalterLiethSeriesId) =>
  getEntityMarker(PAIR_SHAPE_POSITION[side]);

/**
 * Each entity's slot, kept as the list changes: an entity that stays keeps its slot whatever the
 * order; one added takes the lowest slot no one holds (one removed frees its own). With nothing
 * saved, the list's order.
 */
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

/** Whether every entity holds its place in the list as its slot — what no saved slots means. */
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

/** A marker's SVG path — one source for the screen, the export and the map's icons. */
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

/** A hatch's tile — one source for the screen's patterns, the swatches and the export. */
export function getHatchTile(hatch: TSeriesHatch): THatchTile | null {
  return HATCH_TILES[hatch];
}
