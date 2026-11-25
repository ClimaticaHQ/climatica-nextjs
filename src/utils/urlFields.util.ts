import {
  CHART_MODE_BY_PARAM,
  DEFAULT_COMPARE_LAYOUT,
  DEFAULT_SORT_ORDER,
  MARKER_SLOT_SEPARATOR,
  SIDEBAR_PARAMS,
  WALTER_LIETH_COMPARISON,
} from "@/constants";
import { ECompareLayout, ESortOrder, EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";
import type { TChartMode, TCity, TExpandedPanel, TMarkerSlots, TPair, TUrlField } from "@/types";
import { parseCoord } from "./urlParams.util";

export function cityUrlField(paramNames: {
  name: string;
  lat: string;
  lng: string;
}): TUrlField<TCity> {
  return {
    serialize(value, params) {
      params.set(paramNames.name, value.label.trim());
      params.set(paramNames.lat, value.lat.toFixed(4));
      params.set(paramNames.lng, value.lng.toFixed(4));
    },
    parse(params) {
      const lat = parseCoord(params.get(paramNames.lat));
      const lng = parseCoord(params.get(paramNames.lng));
      if (lat === null || lng === null) return undefined;
      const label = params.get(paramNames.name) ?? `${lat}, ${lng}`;
      return { id: `url:${lat},${lng}`, label, description: "", lat, lng };
    },
  };
}

export const compareLayoutUrlField: TUrlField<ECompareLayout> = {
  serialize(value, params) {
    if (value !== DEFAULT_COMPARE_LAYOUT) params.set(SIDEBAR_PARAMS.LAYOUT, value);
  },
  parse(params) {
    const raw = params.get(SIDEBAR_PARAMS.LAYOUT) ?? params.get(SIDEBAR_PARAMS.WL_LAYOUT);
    return Object.values(ECompareLayout).find((layout) => layout === raw);
  },
};

export const chartModeUrlField: TUrlField<TChartMode> = {
  serialize(value, params) {
    if (value === "standard") params.set(SIDEBAR_PARAMS.CHART, SIDEBAR_PARAMS.CHART_MODE_STANDARD);
  },
  parse(params) {
    return CHART_MODE_BY_PARAM[params.get(SIDEBAR_PARAMS.CHART) ?? ""];
  },
};

export const walterLiethShadingUrlField: TUrlField<EWalterLiethShading> = {
  serialize(value, params) {
    if (value !== WALTER_LIETH_COMPARISON.DEFAULT_SHADING) {
      params.set(SIDEBAR_PARAMS.WL_SHADING, value);
    }
  },
  parse(params) {
    const raw = params.get(SIDEBAR_PARAMS.WL_SHADING);
    return Object.values(EWalterLiethShading).find((shading) => shading === raw);
  },
};

const parseYearList = (raw: string | null) => {
  const years = (raw ?? "").split(",").map(Number);
  return raw !== null && raw !== "" && years.every(Number.isInteger) ? years : null;
};

export const weatherYearPairUrlField: TUrlField<TPair<number> | null> = {
  serialize(value, params) {
    if (value !== null) params.set(SIDEBAR_PARAMS.PAIR_YEARS, value.join(","));
  },
  parse(params) {
    const years =
      parseYearList(params.get(SIDEBAR_PARAMS.PAIR_YEARS)) ??
      parseYearList(params.get(SIDEBAR_PARAMS.WL_YEARS));
    const [a, b] = years ?? [];
    return years?.length === 2 && a !== undefined && b !== undefined && a !== b
      ? [a, b]
      : undefined;
  },
};

export const shownYearsUrlField: TUrlField<readonly number[] | null> = {
  serialize(value, params) {
    if (value !== null) params.set(SIDEBAR_PARAMS.SHOWN_YEARS, value.join(","));
  },
  parse(params) {
    const years = parseYearList(params.get(SIDEBAR_PARAMS.SHOWN_YEARS));
    return years !== null && years.length > 0 ? [...new Set(years)] : undefined;
  },
};

export const expandedPanelUrlField: TUrlField<TExpandedPanel> = {
  serialize(value, params) {
    if (value !== null) params.set(SIDEBAR_PARAMS.EXPANDED, value);
  },
  parse(params) {
    const raw = params.get(SIDEBAR_PARAMS.EXPANDED);
    return Object.values(EWalterLiethSeriesId).find((id) => id === raw);
  },
};

export const sortOrderUrlField: TUrlField<ESortOrder> = {
  serialize(value, params) {
    if (value !== DEFAULT_SORT_ORDER) params.set(SIDEBAR_PARAMS.SORT_ORDER, value);
  },
  parse(params) {
    const raw = params.get(SIDEBAR_PARAMS.SORT_ORDER);
    return Object.values(ESortOrder).find((order) => order === raw);
  },
};

export const markerSlotsUrlField: TUrlField<TMarkerSlots | null> = {
  serialize(value, params) {
    if (value === null) return;
    // * by slot — year keys would otherwise come out in numeric order
    const entries = Object.entries(value)
      .sort(([, a], [, b]) => a - b)
      .map(([key, slot]) => `${key}${MARKER_SLOT_SEPARATOR}${slot}`);
    params.set(SIDEBAR_PARAMS.MARKER_SLOTS, entries.join(","));
  },
  parse(params) {
    const raw = params.get(SIDEBAR_PARAMS.MARKER_SLOTS);
    if (!raw) return undefined;
    const entries = raw.split(",").map((entry) => entry.split(MARKER_SLOT_SEPARATOR));
    const slots = entries.map(([key, slot]) => [key ?? "", Number(slot)] as const);
    const isValid = slots.every(([key, slot]) => key !== "" && Number.isInteger(slot) && slot >= 0);
    const isUnique =
      new Set(slots.map(([key]) => key)).size === slots.length &&
      new Set(slots.map(([, slot]) => slot)).size === slots.length;
    return isValid && isUnique ? Object.fromEntries(slots) : undefined;
  },
};
