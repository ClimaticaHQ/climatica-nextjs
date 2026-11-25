import { CSS_VAR_REFERENCE_PATTERN, EXPORT_PALETTE_ATTRIBUTE } from "@/constants";

/** the light palette whatever the active theme, so an export looks the same in both */
export function readExportPalette<T>(read: (style: CSSStyleDeclaration) => T): T {
  const probe = document.createElement("span");
  probe.setAttribute(EXPORT_PALETTE_ATTRIBUTE, "");
  probe.hidden = true;
  document.body.append(probe);
  const result = read(getComputedStyle(probe));
  probe.remove();
  return result;
}

/** a saved SVG has no stylesheet: every var(--token) becomes its light-palette value */
export function resolveCssVars(markup: string): string {
  if (!markup.includes("var(--")) return markup;
  return readExportPalette((style) =>
    markup.replace(CSS_VAR_REFERENCE_PATTERN, (reference, token: string) => {
      const value = style.getPropertyValue(token).trim();
      return value === "" ? reference : value;
    }),
  );
}
