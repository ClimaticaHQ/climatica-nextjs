import type { TSvgToPngParams } from "@/types";
import { triggerDownload } from "../shared/download.util";
import { resolveCssVars } from "../shared/exportPalette.util";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("svgToPng: failed to load SVG image"));
    image.src = src;
  });
}

/** the PNG is rasterized from the same SVG document, so PNG and SVG can't diverge */
export async function svgToPng(params: TSvgToPngParams): Promise<void> {
  const { svg, width, height, filename } = params;
  const scale = params.scale ?? 2;

  const svgBlob = new Blob([resolveCssVars(svg)], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("svgToPng: canvas 2d context unavailable");

    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!pngBlob) throw new Error("svgToPng: canvas.toBlob returned null");

    triggerDownload(URL.createObjectURL(pngBlob), filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
