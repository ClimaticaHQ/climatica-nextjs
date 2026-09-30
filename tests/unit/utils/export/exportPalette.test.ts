import { EXPORT_PALETTE_ATTRIBUTE, WALTER_LIETH_COLOR_VARS } from "@/constants";
import type { TExportChartColors } from "@/types";
import {
  buildWalterLiethPanel,
  getConventionExportPaint,
} from "@/utils/export/svg/walterLiethExport.util";
import { resolveExportColors } from "@/utils/export/svg/resolveExportColors.util";
import { getSharedDomain } from "@/utils/walterLieth.util";
import { afterEach, describe, expect, it, vi } from "vitest";

// * light tokens (:root / [data-export-palette]) vs the dark overrides (html.dark)
const LIGHT: Record<string, string> = {
  [WALTER_LIETH_COLOR_VARS.TEMP]: "#dc2626",
  [WALTER_LIETH_COLOR_VARS.PREC]: "#2563eb",
  [WALTER_LIETH_COLOR_VARS.HUMID_HATCH]: "#2563eb",
  [WALTER_LIETH_COLOR_VARS.ARID_HATCH]: "#dc2626",
  [WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL]: "#1d4ed8",
  "--color-bg": "#ffffff",
};
const DARK: Record<string, string> = {
  [WALTER_LIETH_COLOR_VARS.TEMP]: "#f87171",
  [WALTER_LIETH_COLOR_VARS.PREC]: "#60a5fa",
  [WALTER_LIETH_COLOR_VARS.HUMID_HATCH]: "#60a5fa",
  [WALTER_LIETH_COLOR_VARS.ARID_HATCH]: "#f87171",
  [WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL]: "#3b82f6",
  "--color-bg": "#111827",
};

type TFakeElement = {
  attributes: Set<string>;
  setAttribute: (name: string) => void;
  remove: () => void;
  hidden: boolean;
};

/**
 * A DOM where the dark theme is active: the document root computes to the dark tokens, and
 * only an element carrying the export-palette attribute computes to the light ones — which
 * is exactly what global.css does with `html.dark` and `[data-export-palette]`.
 */
function stubDarkThemeDom() {
  const makeElement = (): TFakeElement => {
    const attributes = new Set<string>();
    return {
      attributes,
      setAttribute: (name) => attributes.add(name),
      remove: () => {},
      hidden: false,
    };
  };
  const root = makeElement();
  vi.stubGlobal("document", {
    documentElement: root,
    createElement: makeElement,
    body: { append: () => {} },
  });
  vi.stubGlobal("getComputedStyle", (element: TFakeElement) => ({
    getPropertyValue: (name: string) =>
      (element.attributes.has(EXPORT_PALETTE_ATTRIBUTE) ? LIGHT : DARK)[name] ?? "",
  }));
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ tavg: 10 + i, prec: i < 6 ? 10 : 150 }));

function buildWith(colors: TExportChartColors) {
  return buildWalterLiethPanel({
    layers: [
      {
        months: MONTHS,
        patternIds: { humid: "h", arid: "a" },
        paint: getConventionExportPaint(colors),
        isShaded: true,
        dotShape: "circle",
      },
    ],
    domain: getSharedDomain([{ months: MONTHS }]),
    colors,
    box: { left: 70, right: 930, top: 170, bottom: 550 },
    clipId: "c",
  });
}

describe("export colors", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("REGRESSION: resolve to the light palette while the dark theme is active", () => {
    stubDarkThemeDom();
    const colors = resolveExportColors();

    expect(colors.wlTemp).toBe(LIGHT[WALTER_LIETH_COLOR_VARS.TEMP]);
    expect(colors.wlCompressedFill).toBe(LIGHT[WALTER_LIETH_COLOR_VARS.COMPRESSED_FILL]);
    expect(colors.bg).toBe(LIGHT["--color-bg"]);
  });

  it("build a WL export with exactly the light colors — none of the dark ones", () => {
    stubDarkThemeDom();
    const svg = buildWith(resolveExportColors());

    Object.values(LIGHT).forEach((color) => expect(svg).toContain(color));
    Object.values(DARK).forEach((color) => expect(svg).not.toContain(color));
  });
});
