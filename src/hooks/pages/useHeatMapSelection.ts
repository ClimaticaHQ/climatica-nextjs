import { HEAT_MAP_URL_SCHEMA } from "@/app/heat-map/_components/HeatMap.constant";
import type { TDrawMode, THeatMapSelectionValue } from "@/app/heat-map/_components/HeatMap.type";
import { useUrlStateSync } from "@/hooks/ui";
import type { TBbox, TPolygon } from "@/types";
import { useState } from "react";

/**
 * The heat map's region — a box or a polygon, kept in the URL — and the drawing tools that
 * pick it. Starting a new shape clears the current one.
 */
export function useHeatMapSelection() {
  const [drawMode, setDrawMode] = useState<TDrawMode>("none");
  const [bbox, setBbox] = useState<TBbox | null>(null);
  const [polygon, setPolygon] = useState<TPolygon | null>(null);

  function applySelection(value: THeatMapSelectionValue) {
    setBbox(value.kind === "bbox" ? value.bbox : null);
    setPolygon(value.kind === "polygon" ? value.polygon : null);
  }

  const { pushUrlState, shareUrl } = useUrlStateSync({
    schema: HEAT_MAP_URL_SCHEMA,
    state: {
      selection: polygon
        ? { kind: "polygon", polygon }
        : bbox
          ? { kind: "bbox", bbox }
          : { kind: "none" },
    },
    onRestore(parsed) {
      if (parsed.selection) applySelection(parsed.selection);
    },
  });

  function select(value: THeatMapSelectionValue) {
    setDrawMode("none");
    applySelection(value);
    pushUrlState({ selection: value });
  }

  function toggleDrawMode(mode: TDrawMode) {
    const next = drawMode === mode ? "none" : mode;
    setDrawMode(next);
    if (next !== "none") applySelection({ kind: "none" });
  }

  return {
    selection: { bbox, polygon, drawMode },
    hasSelection: bbox !== null || polygon !== null,
    shareUrl,
    onBboxModeToggle: () => toggleDrawMode("bbox"),
    onPolygonModeToggle: () => toggleDrawMode("polygon"),
    onClear: () => select({ kind: "none" }),
    onBboxComplete: (next: TBbox) => select({ kind: "bbox", bbox: next }),
    onPolygonComplete: (next: TPolygon) => select({ kind: "polygon", polygon: next }),
  };
}
