import { EXPORT_FONT_FAMILY, EXPORT_TEXT } from "@/constants";

/** Rough width of a string at a font size — the fallback where no canvas can measure it. */
export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * EXPORT_TEXT.AVG_CHAR_WIDTH_RATIO;
}

// * one lazily created 2D context for every measurement (null outside a browser)
let measureContext: CanvasRenderingContext2D | null | undefined;

function getMeasureContext() {
  if (measureContext === undefined) {
    measureContext =
      typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  }
  return measureContext;
}

/**
 * A string's width in the export's own font stack, measured with canvas measureText —
 * falling back to the estimate where there's no canvas (server, unit tests).
 */
export function measureExportText(text: string, fontSize: number): number {
  const context = getMeasureContext();
  if (!context) return estimateTextWidth(text, fontSize);
  context.font = `${fontSize}px ${EXPORT_FONT_FAMILY}`;
  return context.measureText(text).width;
}

/** Greedy word wrap to lines no wider than maxWidth at the given font size. */
export function wrapWords(text: string, maxWidth: number, fontSize: number): string[] {
  return text.split(" ").reduce<string[]>((lines, word) => {
    const last = lines.at(-1);
    const candidate = last === undefined ? word : `${last} ${word}`;
    if (last !== undefined && estimateTextWidth(candidate, fontSize) <= maxWidth) {
      return [...lines.slice(0, -1), candidate];
    }
    return [...lines, word];
  }, []);
}
