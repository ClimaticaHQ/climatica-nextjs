import {
  DATA_UPDATE_ALL_SERIES,
  UPDATE_FLASH_GLOW_BLUR_RATIO,
  UPDATE_FLASH_GLOW_PX,
} from "@/constants";
import type {
  TDataUpdateInput,
  TDataUpdateSeries,
  TDataUpdateState,
  TShouldFlashArgs,
  TUpdateFlashKeyframeArgs,
} from "@/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Plain-data equality: primitives, arrays and objects compared by value, not identity. */
export function isSameData(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, i) => isSameData(item, b[i]))
    );
  }
  if (!isRecord(a) || !isRecord(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => isSameData(a[key], b[key]));
}

// * no data yet, or none for this filter (an empty series)
const hasData = (value: unknown) =>
  value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0);

/**
 * The series whose data changed between two renders. Loading (no data before) and losing
 * data (none after) are not changes — only new data replacing shown data is.
 */
export function getChangedSeries(prev: TDataUpdateSeries, next: TDataUpdateSeries): string[] {
  return Object.keys(next).filter(
    (key) => hasData(prev[key]) && hasData(next[key]) && !isSameData(prev[key], next[key]),
  );
}

/** The provider's state after a render: the same object while no series' data changed. */
export function reduceDataUpdate(
  state: TDataUpdateState,
  { series, announcement }: TDataUpdateInput,
): TDataUpdateState {
  const keys = new Set([...Object.keys(state.values), ...Object.keys(series)]);
  if ([...keys].every((key) => isSameData(state.values[key], series[key]))) return state;

  const changed = getChangedSeries(state.values, series);
  if (changed.length === 0) return { ...state, values: series };
  return {
    values: series,
    update: { id: state.update.id + 1, changed },
    announcement,
  };
}

/** A card flashes once per fresh update that changed a series it shows. */
export function shouldFlash({ update, isFresh, handledId, keys }: TShouldFlashArgs) {
  if (!isFresh || update.id === handledId || update.id === 0) return false;
  return keys === DATA_UPDATE_ALL_SERIES || keys.some((key) => update.changed.includes(key));
}

/** The flash's first keyframe — green border, plus the glow in the Glow variant. */
export function getUpdateFlashKeyframe({
  border,
  glow,
  variant,
}: TUpdateFlashKeyframeArgs): Keyframe {
  const glowPx = UPDATE_FLASH_GLOW_PX[variant];
  const glowShadow = `0 0 ${glowPx * UPDATE_FLASH_GLOW_BLUR_RATIO}px ${glowPx}px ${glow}`;
  return { offset: 0, borderColor: border, ...(glowPx > 0 ? { boxShadow: glowShadow } : {}) };
}
