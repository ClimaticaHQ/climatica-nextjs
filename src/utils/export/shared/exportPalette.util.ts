import { CSS_VAR_REFERENCE_PATTERN, EXPORT_PALETTE_ATTRIBUTE } from "@/constants";

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

/**
 * Replaces every var(--token) in an export's markup with the token's light-palette value: a
 * saved SVG has no stylesheet to resolve them, and a series' colour reaches the builders as a
 * token reference. A token the palette doesn't know is left as it is.
 */
export function resolveCssVars(markup: string): string {
  if (!markup.includes("var(--")) return markup;
  return readExportPalette((style) =>
    markup.replace(CSS_VAR_REFERENCE_PATTERN, (reference, token: string) => {
      const value = style.getPropertyValue(token).trim();
      return value === "" ? reference : value;
    }),
  );
}
