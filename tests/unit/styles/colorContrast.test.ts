import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WCAG_CONTRAST } from "@/constants/contrast.constant";
import { contrastRatio } from "@/utils/contrast.util";

// * the semantic tokens of both themes, resolved to their primitives' values (docs/colors.md)
const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selector: (match[1] ?? "").replace(/\/\*[\s\S]*?\*\//g, "").trim(),
  declarations: new Map(
    [...(match[2] ?? "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [
      d[1] ?? "",
      (d[2] ?? "").trim(),
    ]),
  ),
}));
const declarationsOf = (selector: string) =>
  blocks.find((block) => block.selector.replace(/\s+/g, " ") === selector)?.declarations ??
  new Map<string, string>();

const primitives = blocks[0]?.declarations ?? new Map<string, string>();
const light = declarationsOf(":root, [data-export-palette]");
const THEMES = {
  light,
  dark: new Map([...light, ...declarationsOf("html.dark")]),
};
const THEME_NAMES = ["light", "dark"] as const;

/** "--color-text" in a theme → "#212121"; a primitive's name → its value. */
function resolve(theme: keyof typeof THEMES, name: string) {
  const value = THEMES[theme].get(name) ?? name;
  const primitive = /^var\((--[\w-]+)\)$/.exec(value)?.[1] ?? value;
  return primitives.get(primitive) ?? "";
}

const MARTONNE_CLASSES = [
  "arid",
  "semi-arid",
  "mediterranean",
  "semi-humid",
  "humid",
  "very-humid",
  "extremely-humid",
];
const CELL_COUNT_LEVELS = ["fast", "moderate", "slow", "too-many"];
const badge = (name: string): [string, string] => [`--color-${name}-text`, `--color-${name}-bg`];

// * [foreground, background]
const TEXT_PAIRS: [string, string][] = [
  ["--color-on-primary", "--color-primary"],
  ...["--color-text", "--color-text-secondary"].flatMap((text): [string, string][] => [
    [text, "--color-surface"],
    [text, "--color-surface-secondary"],
  ]),
  ["--color-error", "--color-error-bg"],
  ...MARTONNE_CLASSES.map((name) => badge(`martonne-${name}`)),
  ...CELL_COUNT_LEVELS.map((level) => badge(`cell-count-${level}`)),
  badge("month-badge"),
  badge("chip-active"),
];
// * data marks a reader tells apart on the chart card: the lines' semantic colours, the entities'
// * graphite shapes, the Walter-Lieth frost band. Bar fills need no 3:1: their values are in the
// * monthly values table and the tooltip
const DATA_MARKS = [
  "--color-series-marker",
  "--color-chart-temp-max",
  "--color-chart-temp-min",
  "--color-chart-temp-avg",
  "--color-wl-frost",
];
const GRAPHIC_PAIRS: [string, string][] = [
  ["--color-brand", "--color-surface"],
  ...DATA_MARKS.map((mark): [string, string] => [mark, "--color-surface"]),
  // * an entity's shape on a neutral year badge
  ["--color-series-marker", "--color-surface-secondary"],
];

// * every tint set's text on its background, used by a token or not:
// * light text (tone 34) on light background (95), dark text (85) on dark background (20)
const TINT_SET_TEXT = /^--tint-(?:light-(.+)-34|dark-(.+)-85)$/;
const TINT_SET_PAIRS: [string, string][] = [...primitives.keys()]
  .map((name) => TINT_SET_TEXT.exec(name))
  .filter((match) => match !== null)
  .map(([name, lightHue, darkHue]): [string, string] => [
    name,
    lightHue ? `--tint-light-${lightHue}-95` : `--tint-dark-${darkHue}-20`,
  ]);

function failures(
  pairs: [string, string][],
  minimum: number,
  themes: readonly (typeof THEME_NAMES)[number][] = THEME_NAMES,
) {
  return themes.flatMap((theme) =>
    pairs
      .map(([fg, bg]) => ({ fg, bg, ratio: contrastRatio(resolve(theme, fg), resolve(theme, bg)) }))
      .filter(({ ratio }) => !(ratio >= minimum))
      .map(({ fg, bg, ratio }) => `${theme}: ${fg} on ${bg} = ${ratio.toFixed(2)}`),
  );
}

describe("colour contrast (WCAG 2.x), both themes", () => {
  it("resolves every pair to colour values", () => {
    const unresolved = [...TEXT_PAIRS, ...GRAPHIC_PAIRS, ...TINT_SET_PAIRS]
      .flat()
      .flatMap((name) => THEME_NAMES.map((theme) => [theme, name] as const))
      .filter(([theme, name]) => !/^#[0-9a-f]{6}$/.test(resolve(theme, name)))
      .map(([theme, name]) => `${theme}: ${name}`);
    expect(unresolved).toEqual([]);
    expect(TINT_SET_PAIRS.length).toBeGreaterThan(0);
  });

  it("text on its background reaches 4.5:1", () => {
    expect(failures(TEXT_PAIRS, WCAG_CONTRAST.TEXT)).toEqual([]);
  });

  it("every tint set's text on its background reaches 4.5:1", () => {
    // * primitives: the same in either theme
    expect(failures(TINT_SET_PAIRS, WCAG_CONTRAST.TEXT, ["light"])).toEqual([]);
  });

  it("the brand, the data marks and the entity shapes reach 3:1", () => {
    expect(failures(GRAPHIC_PAIRS, WCAG_CONTRAST.LARGE_TEXT_OR_GRAPHIC)).toEqual([]);
  });
});
