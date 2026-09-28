import { EXPORT_PALETTE_ATTRIBUTE } from "@/constants";

/**
 * Reads CSS custom properties from the light palette, whatever theme is active, so an
 * exported PNG/SVG looks the same in light and dark mode. A hidden probe element carrying
 * EXPORT_PALETTE_ATTRIBUTE re-declares the :root (light) tokens on itself (global.css), so
 * its computed values ignore html.dark.
 */
export function readExportPalette<T>(read: (style: CSSStyleDeclaration) => T): T {
  const probe = document.createElement("span");
  probe.setAttribute(EXPORT_PALETTE_ATTRIBUTE, "");
  probe.hidden = true;
  document.body.append(probe);
  const result = read(getComputedStyle(probe));
  probe.remove();
  return result;
}
