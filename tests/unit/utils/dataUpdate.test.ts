import {
  DATA_UPDATE_ALL_SERIES,
  DEFAULT_UPDATE_FLASH_VARIANT,
  MOTION,
  NO_DATA_UPDATE,
  UPDATE_FLASH_GLOW_PX,
} from "@/constants";
import { EUpdateFlashVariant } from "@/enums";
import type { TDataUpdateState } from "@/types";
import {
  getChangedSeries,
  getUpdateFlashKeyframe,
  isSameData,
  reduceDataUpdate,
  shouldFlash,
} from "@/utils/dataUpdate.util";
import { createDelayedFlag } from "@/utils/delayedFlag.util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const months = (tavg: number) =>
  Array.from({ length: 12 }, (_, i) => ({ month: i + 1, tavg: tavg + i, prec: null }));

const initial = (values: Record<string, unknown>): TDataUpdateState => ({
  values,
  update: NO_DATA_UPDATE,
  announcement: "",
});

describe("change detection per series", () => {
  it("compares data by value, not identity", () => {
    expect(isSameData(months(4), months(4))).toBe(true);
    expect(isSameData(months(4), months(5))).toBe(false);
    expect(isSameData({ a: [1, null] }, { a: [1, 0] })).toBe(false);
  });

  it("reports only the series whose data changed", () => {
    const prev = { a: months(4), b: months(10) };
    expect(getChangedSeries(prev, { a: months(4), b: months(12) })).toEqual(["b"]);
    expect(getChangedSeries(prev, { a: months(5), b: months(12) })).toEqual(["a", "b"]);
  });

  it("reports nothing when the data didn't change", () => {
    expect(getChangedSeries({ a: months(4) }, { a: months(4) })).toEqual([]);
  });

  it("does not count the first load or missing data as a change", () => {
    expect(getChangedSeries({ a: null }, { a: months(4) })).toEqual([]);
    expect(getChangedSeries({ a: months(4) }, { a: null })).toEqual([]);
    expect(getChangedSeries({}, { a: months(4) })).toEqual([]);
    expect(getChangedSeries({ a: months(4) }, { a: [] })).toEqual([]);
    expect(getChangedSeries({ a: [] }, { a: months(4) })).toEqual([]);
  });

  it("counts an update only when shown data is replaced, announcing it", () => {
    const loaded = reduceDataUpdate(initial({ a: null, b: null }), {
      series: { a: months(4), b: months(10) },
      announcement: "first",
    });
    expect(loaded.update.id).toBe(0);

    const same = reduceDataUpdate(loaded, {
      series: { a: months(4), b: months(10) },
      announcement: "x",
    });
    expect(same).toBe(loaded);

    const changed = reduceDataUpdate(loaded, {
      series: { a: months(4), b: months(12) },
      announcement: "Data updated: Madrid, Lviv",
    });
    expect(changed.update).toEqual({ id: 1, changed: ["b"] });
    expect(changed.announcement).toBe("Data updated: Madrid, Lviv");
  });
});

describe("update flash", () => {
  const update = { id: 3, changed: ["b"] };

  it("fires only for cards showing a changed series", () => {
    expect(shouldFlash({ update, isFresh: true, handledId: 2, keys: ["b"] })).toBe(true);
    expect(shouldFlash({ update, isFresh: true, handledId: 2, keys: ["a"] })).toBe(false);
    expect(shouldFlash({ update, isFresh: true, handledId: 2, keys: ["a", "b"] })).toBe(true);
    expect(shouldFlash({ update, isFresh: true, handledId: 2, keys: DATA_UPDATE_ALL_SERIES })).toBe(
      true,
    );
  });

  it("fires for a card the update's crossfade just remounted", () => {
    expect(shouldFlash({ update, isFresh: true, handledId: null, keys: ["b"] })).toBe(true);
  });

  it("never fires on the first load", () => {
    expect(
      shouldFlash({ update: NO_DATA_UPDATE, isFresh: true, handledId: null, keys: ["b"] }),
    ).toBe(false);
  });

  it("never fires for a chart type or layout switch after the update's commit", () => {
    // * the switch mounts new cards once the provider has consumed the update
    expect(shouldFlash({ update, isFresh: false, handledId: null, keys: ["b"] })).toBe(false);
  });

  it("fires once per update", () => {
    expect(shouldFlash({ update, isFresh: true, handledId: 3, keys: ["b"] })).toBe(false);
  });

  it("draws the green border with a 3 px soft glow in the Glow variant", () => {
    const colors = { border: "green", glow: "rgba(0, 128, 0, 0.3)" };
    expect(getUpdateFlashKeyframe({ ...colors, variant: EUpdateFlashVariant.GLOW })).toEqual({
      offset: 0,
      borderColor: "green",
      boxShadow: "0 0 6px 3px rgba(0, 128, 0, 0.3)",
    });
  });

  it("draws only the green border in the Border variant", () => {
    const colors = { border: "green", glow: "rgba(0, 128, 0, 0.3)" };
    expect(getUpdateFlashKeyframe({ ...colors, variant: EUpdateFlashVariant.BORDER })).toEqual({
      offset: 0,
      borderColor: "green",
    });
  });

  it("gives every variant a glow size, the Glow variant the default", () => {
    expect(UPDATE_FLASH_GLOW_PX).toEqual({
      [EUpdateFlashVariant.GLOW]: 3,
      [EUpdateFlashVariant.BORDER]: 0,
    });
    expect(DEFAULT_UPDATE_FLASH_VARIANT).toBe(EUpdateFlashVariant.GLOW);
  });
});

describe("loading delay", () => {
  const delayMs = MOTION.UPDATE_LOADING_DELAY_MS;

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows loading only once a fetch has lasted the delay", () => {
    const onChange = vi.fn();
    const flag = createDelayedFlag({ delayMs, onChange });
    flag.set(true);
    vi.advanceTimersByTime(delayMs - 1);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
    flag.set(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("never shows loading for a fast response", () => {
    const onChange = vi.fn();
    const flag = createDelayedFlag({ delayMs, onChange });
    flag.set(true);
    vi.advanceTimersByTime(delayMs / 2);
    flag.set(false);
    vi.advanceTimersByTime(delayMs * 2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not restart the delay while fetching continues", () => {
    const onChange = vi.fn();
    const flag = createDelayedFlag({ delayMs, onChange });
    flag.set(true);
    vi.advanceTimersByTime(delayMs / 2);
    flag.set(true);
    vi.advanceTimersByTime(delayMs / 2);
    expect(onChange).toHaveBeenCalledOnce();
  });
});
